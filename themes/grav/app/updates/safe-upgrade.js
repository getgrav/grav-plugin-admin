import $ from 'jquery';
import { config, translations } from 'grav-config';
import formatBytes from '../utils/formatbytes';
import request from '../utils/request';

const t = (key, fallback = '') => {
    if (translations && translations.PLUGIN_ADMIN && translations.PLUGIN_ADMIN[key]) {
        return translations.PLUGIN_ADMIN[key];
    }

    return fallback;
};

const r = (key, value, fallback = '') => {
    const template = t(key, fallback);
    if (!template || typeof template.replace !== 'function') {
        return fallback.replace('%s', value);
    }

    return template.replace('%s', value);
};

const STAGE_TITLES = {
    initializing: () => t('SAFE_UPGRADE_STAGE_INITIALIZING', 'Preparing upgrade'),
    downloading: () => t('SAFE_UPGRADE_STAGE_DOWNLOADING', 'Downloading update'),
    installing: () => t('SAFE_UPGRADE_STAGE_INSTALLING', 'Installing update'),
    finalizing: () => t('SAFE_UPGRADE_STAGE_FINALIZING', 'Finalizing changes'),
    complete: () => t('SAFE_UPGRADE_STAGE_COMPLETE', 'Upgrade complete'),
    error: () => t('SAFE_UPGRADE_STAGE_ERROR', 'Upgrade encountered an error')
};

export default class SafeUpgrade {
    constructor(updatesInstance) {
        this.updates = updatesInstance;
        this.modalElement = $('[data-remodal-id="update-grav"]');
        this.modal = this.modalElement.remodal({ hashTracking: false });
        this.steps = {
            preflight: this.modalElement.find('[data-safe-upgrade-step="preflight"]'),
            progress: this.modalElement.find('[data-safe-upgrade-step="progress"]'),
            result: this.modalElement.find('[data-safe-upgrade-step="result"]')
        };
        this.buttons = {
            start: this.modalElement.find('[data-safe-upgrade-action="start"]'),
            cancel: this.modalElement.find('[data-safe-upgrade-action="cancel"]'),
            recheck: this.modalElement.find('[data-safe-upgrade-action="recheck"]')
        };

        this.urls = this.buildUrls();
        this.decisions = {};
        this.pollTimer = null;
        this.statusRequest = null;
        this.isPolling = false;
        this.active = false;

        this.registerEvents();
    }

    buildUrls() {
        const task = `task${config.param_sep}`;
        const nonce = `admin-nonce${config.param_sep}${config.admin_nonce}`;
        const base = `${config.base_url_relative}/update.json`;

        return {
            preflight: `${base}/${task}safeUpgradePreflight/${nonce}`,
            start: `${base}/${task}safeUpgradeStart/${nonce}`,
            status: `${base}/${task}safeUpgradeStatus/${nonce}`
        };
    }

    registerEvents() {
        $(document).on('click', '#grav-update-button', (event) => {
            if ($(event.currentTarget).hasClass('pointer-events-none')) {
                return;
            }
            event.preventDefault();
            this.open();
        });

        this.modalElement.on('closed', () => {
            this.stopPolling();
            this.active = false;
        });

        this.modalElement.on('click', '[data-safe-upgrade-action="recheck"]', (event) => {
            event.preventDefault();
            if (!this.active) {
                return;
            }
            this.fetchPreflight(true);
        });

        this.modalElement.on('click', '[data-safe-upgrade-action="start"]', (event) => {
            event.preventDefault();
            if ($(event.currentTarget).prop('disabled')) {
                return;
            }
            this.startUpgrade();
        });

        this.modalElement.on('change', '[data-safe-upgrade-decision]', (event) => {
            const target = $(event.currentTarget);
            const decision = target.val();
            const type = target.data('safe-upgrade-decision');
            this.decisions[type] = decision;
            this.updateStartButtonState();
        });
    }

    setPayload(payload = {}) {
        this.payload = payload;
    }

    open() {
        this.active = true;
        this.decisions = {};
        this.renderLoading();
        this.modal.open();
        this.fetchPreflight();
    }

    renderLoading() {
        this.switchStep('preflight');
        this.steps.preflight.html(`
            <div class="safe-upgrade-loading">
                <span class="fa fa-refresh fa-spin"></span>
                <p>${t('SAFE_UPGRADE_CHECKING', 'Running preflight checks...')}</p>
            </div>
        `);
        this.buttons.start.prop('disabled', true).addClass('hidden');
        this.modalElement.find('[data-safe-upgrade-footer]').removeClass('hidden');
    }

    fetchPreflight(silent = false) {
        if (!silent) {
            this.renderLoading();
        }

        request(this.urls.preflight, (response) => {
            if (!this.active) {
                return;
            }

            if (response.status === 'error') {
                this.renderPreflightError(response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'));
                return;
            }

            this.renderPreflight(response.data || {});
        });
    }

    renderPreflightError(message) {
        this.switchStep('preflight');
        this.steps.preflight.html(`
            <div class="safe-upgrade-error">
                <p>${message}</p>
                <button data-safe-upgrade-action="recheck" class="button secondary">${t('SAFE_UPGRADE_RECHECK', 'Re-run Checks')}</button>
            </div>
        `);
        this.buttons.start.prop('disabled', true).addClass('hidden');
    }

    renderPreflight(data) {
        const blockers = [];
        const version = data.version || {};
        const releaseDate = version.release_date || '';
        const packageSize = version.package_size ? formatBytes(version.package_size) : t('SAFE_UPGRADE_UNKNOWN_SIZE', 'unknown');
        const warnings = (data.preflight && data.preflight.warnings) || [];
        const pending = (data.preflight && data.preflight.plugins_pending) || {};
        const psrConflicts = (data.preflight && data.preflight.psr_log_conflicts) || {};
        const monologConflicts = (data.preflight && data.preflight.monolog_conflicts) || {};

        if (data.status === 'error') {
            blockers.push(data.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'));
        }

        if (!data.requirements || !data.requirements.meets) {
            blockers.push(r('SAFE_UPGRADE_REQUIREMENTS_FAIL', data.requirements ? data.requirements.minimum_php : '?', 'PHP %s or newer is required before continuing.'));
        }

        if (data.symlinked) {
            blockers.push(t('GRAV_SYMBOLICALLY_LINKED', 'Grav is symbolically linked. Upgrade will not be available.'));
        }

        if (data.safe_upgrade && data.safe_upgrade.enabled === false) {
            blockers.push(t('SAFE_UPGRADE_DISABLED', 'Safe upgrade is disabled. Enable it in Configuration ▶ System ▶ Updates.'));
        }

        if (!data.safe_upgrade || !data.safe_upgrade.staging_ready) {
            const err = data.safe_upgrade && data.safe_upgrade.error ? data.safe_upgrade.error : t('SAFE_UPGRADE_STAGING_ERROR', 'Safe upgrade staging directory is not writable.');
            blockers.push(err);
        }

        if (!data.upgrade_available) {
            blockers.push(t('SAFE_UPGRADE_NOT_AVAILABLE', 'No Grav update is available.'));
        }

        if (Object.keys(pending).length) {
            blockers.push(t('SAFE_UPGRADE_PENDING_HINT', 'Update all plugins and themes before proceeding.'));
        }

        const warningsList = warnings.length ? `
            <div class="safe-upgrade-alert">
                <strong>${t('SAFE_UPGRADE_WARNINGS', 'Warnings')}</strong>
                <ul>${warnings.map((warning) => `<li>${warning}</li>`).join('')}</ul>
            </div>
        ` : '';

        const pendingList = Object.keys(pending).length ? `
            <div class="safe-upgrade-pending">
                <strong>${t('SAFE_UPGRADE_PENDING_UPDATES', 'Pending plugin or theme updates')}</strong>
                <ul>
                    ${Object.keys(pending).map((slug) => {
                        const item = pending[slug] || {};
                        const type = item.type || 'plugin';
                        const current = item.current || t('SAFE_UPGRADE_UNKNOWN_VERSION', 'unknown');
                        const next = item.available || t('SAFE_UPGRADE_UNKNOWN_VERSION', 'unknown');
                        return `<li><code>${slug}</code> (${type}) ${current} &rarr; ${next}</li>`;
                    }).join('')}
                </ul>
            </div>
        ` : '';

        const psrList = Object.keys(psrConflicts).length ? `
            <div class="safe-upgrade-conflict">
                <div class="safe-upgrade-conflict-header">
                    <strong>${t('SAFE_UPGRADE_CONFLICTS_PSR', 'Potential psr/log compatibility issues')}</strong>
                    ${this.renderDecisionSelect('psr_log')}
                </div>
                <ul>
                    ${Object.keys(psrConflicts).map((slug) => {
                        const info = psrConflicts[slug] || {};
                        const requires = info.requires || '*';
                        return `<li><code>${slug}</code> &mdash; ${r('SAFE_UPGRADE_CONFLICTS_REQUIRES', requires, 'Requires psr/log %s')}</li>`;
                    }).join('')}
                </ul>
            </div>
        ` : '';

        const monologList = Object.keys(monologConflicts).length ? `
            <div class="safe-upgrade-conflict">
                <div class="safe-upgrade-conflict-header">
                    <strong>${t('SAFE_UPGRADE_CONFLICTS_MONOLOG', 'Potential Monolog API compatibility issues')}</strong>
                    ${this.renderDecisionSelect('monolog')}
                </div>
                <ul>
                    ${Object.keys(monologConflicts).map((slug) => {
                        const entries = Array.isArray(monologConflicts[slug]) ? monologConflicts[slug] : [];
                        const details = entries.map((entry) => {
                            const method = entry.method || '';
                            const file = entry.file ? basename(entry.file) : '';
                            return `<span>${method} ${file ? `<code>${file}</code>` : ''}</span>`;
                        }).join(', ');

                        return `<li><code>${slug}</code> &mdash; ${details}</li>`;
                    }).join('')}
                </ul>
            </div>
        ` : '';

        const blockersList = blockers.length ? `
            <div class="safe-upgrade-blockers">
                <ul>${blockers.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
        ` : '';

        const summary = `
            <div class="safe-upgrade-summary">
                <p>${r('SAFE_UPGRADE_SUMMARY_CURRENT', version.local || '?', 'Current Grav version: <strong>v%s</strong>')}</p>
                <p>${r('SAFE_UPGRADE_SUMMARY_REMOTE', version.remote || '?', 'Available Grav version: <strong>v%s</strong>')}</p>
                <p>${releaseDate ? r('SAFE_UPGRADE_RELEASED_ON', releaseDate, 'Released on %s') : ''}</p>
                <p>${r('SAFE_UPGRADE_PACKAGE_SIZE', packageSize, 'Package size: %s')}</p>
            </div>
        `;

        this.steps.preflight.html(`
            <div class="safe-upgrade-preflight">
                ${summary}
                ${warningsList}
                ${pendingList}
                ${psrList}
                ${monologList}
                ${blockersList}
                <div class="safe-upgrade-actions inline-actions">
                    <button data-safe-upgrade-action="recheck" class="button secondary">${t('SAFE_UPGRADE_RECHECK', 'Re-run Checks')}</button>
                </div>
            </div>
        `);

        this.switchStep('preflight');

        const hasBlockingConflicts = (Object.keys(psrConflicts).length && !this.decisions.psr_log) || (Object.keys(monologConflicts).length && !this.decisions.monolog);
        const canStart = !blockers.length && !hasBlockingConflicts;

        this.buttons.start
            .removeClass('hidden')
            .prop('disabled', !canStart)
            .text(t('SAFE_UPGRADE_START', 'Start Safe Upgrade'));

        if (Object.keys(psrConflicts).length && !this.decisions.psr_log) {
            this.decisions.psr_log = 'disable';
        }

        if (Object.keys(monologConflicts).length && !this.decisions.monolog) {
            this.decisions.monolog = 'disable';
        }

        this.updateStartButtonState();
    }

    renderDecisionSelect(type) {
        return `
            <label class="safe-upgrade-decision">
                <span>${t('SAFE_UPGRADE_DECISION_PROMPT', 'When conflicts are detected:')}</span>
                <select data-safe-upgrade-decision="${type}">
                    <option value="disable">${t('SAFE_UPGRADE_DECISION_DISABLE', 'Disable conflicting plugins')}</option>
                    <option value="continue">${t('SAFE_UPGRADE_DECISION_CONTINUE', 'Continue with plugins enabled')}</option>
                </select>
            </label>
        `;
    }

    updateStartButtonState() {
        const decisionInputs = this.modalElement.find('[data-safe-upgrade-decision]');
        const unresolved = [];
        decisionInputs.each((index, element) => {
            const input = $(element);
            const key = input.data('safe-upgrade-decision');
            if (!this.decisions[key]) {
                unresolved.push(key);
            }
        });

        const hasUnresolvedConflicts = unresolved.length > 0;
        const blockers = this.steps.preflight.find('.safe-upgrade-blockers li');

        const disabled = hasUnresolvedConflicts || blockers.length > 0;
        this.buttons.start.prop('disabled', disabled);
    }

    startUpgrade() {
        this.switchStep('progress');
        this.renderProgress({
            stage: 'initializing',
            message: t('SAFE_UPGRADE_STAGE_INITIALIZING', 'Preparing upgrade'),
            percent: 0
        });

        this.buttons.start.prop('disabled', true);

        this.stopPolling();
        this.beginPolling();

        const body = {
            decisions: this.decisions
        };

        request(this.urls.start, { method: 'post', body }, (response) => {
            if (response.status === 'error') {
                this.stopPolling();
                this.renderProgress({
                    stage: 'error',
                    message: response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'),
                    percent: null
                });
                this.renderResult({
                    status: 'error',
                    message: response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.')
                });
                return;
            }

            const data = response.data || {};
            if (data.status === 'error') {
                this.stopPolling();
                this.renderProgress({
                    stage: 'error',
                    message: data.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'),
                    percent: null
                });
                this.renderResult(data);
                return;
            }

            this.renderResult(data);
            this.stopPolling();
            this.renderProgress({
                stage: 'complete',
                message: data.message || t('SAFE_UPGRADE_STAGE_COMPLETE', 'Upgrade complete'),
                percent: 100,
                target_version: data.version || (data.manifest && data.manifest.target_version) || null,
                manifest: data.manifest || null
            });
        });
    }

    beginPolling(delay = 1200) {
        if (this.isPolling) {
            return;
        }

        this.isPolling = true;
        this.schedulePoll(delay);
    }

    schedulePoll(delay = 1200) {
        this.clearPollTimer();
        if (!this.isPolling) {
            return;
        }

        this.pollTimer = setTimeout(() => {
            this.fetchStatus(true);
        }, delay);
    }

    clearPollTimer() {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    fetchStatus(silent = false) {
        if (this.statusRequest) {
            return;
        }

        this.pollTimer = null;
        let nextStage = null;

        let shouldContinue = true;

        this.statusRequest = request(this.urls.status, (response) => {
            if (response.status === 'error') {
                if (!silent) {
                    this.renderProgress({
                        stage: 'error',
                        message: response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'),
                        percent: null
                    });
                }
                nextStage = 'error';
                return;
            }

            const data = response.data || {};
            nextStage = data.stage || null;
            this.renderProgress(data);

            if (nextStage === 'installing' || nextStage === 'finalizing' || nextStage === 'complete') {
                shouldContinue = false;
            }
        });

        const finalize = () => {
            this.statusRequest = null;

            if (!this.isPolling) {
                return;
            }

            if (nextStage === 'complete' || nextStage === 'error') {
                this.stopPolling();
            } else if (shouldContinue) {
                this.schedulePoll();
            } else {
                this.stopPolling();
            }
        };

        this.statusRequest.then(finalize, finalize);
    }

    renderProgress(data) {
        if (!data) {
            return;
        }

        const stage = data.stage || 'initializing';
        const titleResolver = STAGE_TITLES[stage] || STAGE_TITLES.initializing;
        const title = titleResolver();
        const percent = typeof data.percent === 'number' ? data.percent : null;
        const percentLabel = percent !== null ? `${percent}%` : '';

        this.steps.progress.html(`
            <div class="safe-upgrade-progress">
                <h3>${title}</h3>
                <p>${data.message || ''}</p>
                ${percentLabel ? `<div class="safe-upgrade-progress-bar"><span style="width:${percent}%"></span></div><div class="progress-value">${percentLabel}</div>` : ''}
            </div>
        `);

        this.switchStep('progress');

        if (stage === 'complete') {
            this.renderResult({
                status: 'success',
                manifest: data.manifest || null,
                version: data.target_version || null
            });
        } else if (stage === 'error') {
            this.renderResult({
                status: 'error',
                message: data.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.')
            });
        }
    }

    renderResult(result) {
        const status = result.status || 'success';

        if (status === 'success' || status === 'finalized') {
            const manifest = result.manifest || {};
            const target = result.version || manifest.target_version || '';
            const backup = manifest.backup_path || '';
            const identifier = manifest.id || '';

            this.steps.result.html(`
                <div class="safe-upgrade-result success">
                    <h3>${r('SAFE_UPGRADE_RESULT_SUCCESS', target, 'Grav upgraded to v%s')}</h3>
                    ${identifier ? `<p>${r('SAFE_UPGRADE_RESULT_MANIFEST', identifier, 'Snapshot reference: %s')}</p>` : ''}
                    ${backup ? `<p>${r('SAFE_UPGRADE_RESULT_ROLLBACK', backup, 'Rollback snapshot stored at: %s')}</p>` : ''}
                </div>
            `);

            this.switchStep('result');
            $('[data-gpm-grav]').remove();
            if (target) {
                $('#footer .grav-version').html(`v${target}`);
            }
            if (this.updates) {
                this.updates.fetch(true);
            }
        } else if (status === 'noop') {
            this.steps.result.html(`
                <div class="safe-upgrade-result neutral">
                    <h3>${t('SAFE_UPGRADE_RESULT_NOOP', 'Grav is already up to date.')}</h3>
                </div>
            `);
            this.switchStep('result');
        } else {
            this.steps.result.html(`
                <div class="safe-upgrade-result error">
                    <h3>${t('SAFE_UPGRADE_RESULT_FAILURE', 'Safe upgrade failed')}</h3>
                    <p>${result.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.')}</p>
                </div>
            `);
            this.switchStep('result');
        }
    }

    switchStep(step) {
        Object.keys(this.steps).forEach((handle) => {
            this.steps[handle].toggle(handle === step);
        });
    }

    stopPolling() {
        this.isPolling = false;
        this.clearPollTimer();
    }
}

function basename(path) {
    if (!path) { return ''; }
    return path.split(/[\\/]/).pop();
}
