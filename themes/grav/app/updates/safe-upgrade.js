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
    queued: () => t('SAFE_UPGRADE_STAGE_QUEUED', 'Waiting for worker'),
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
            recheck: this.modalElement.find('[data-safe-upgrade-action="recheck"]'),
            finish: this.modalElement.find('[data-safe-upgrade-action="finish"]')
        };

        this.urls = this.buildUrls();
        this.decisions = {};
        this.pollTimer = null;
        this.statusRequest = null;
        this.isPolling = false;
        this.active = false;
        this.jobId = null;
        this.statusFailures = 0;
        this.statusContext = null;
        this.statusIdleCount = 0;
        this.currentStage = null;
        this.stageEnteredAt = 0;
        this.directStatusUrl = this.resolveDirectStatusUrl();
        this.preferDirectStatus = !!this.directStatusUrl;
        this.modalLocked = false;

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

        this.modalElement.on('click', '[data-safe-upgrade-action="finish"]', (event) => {
            event.preventDefault();
            const button = $(event.currentTarget);
            if (button.prop('disabled')) {
                return;
            }
            this.modalLocked = false;
            this.modal.close('finish');
            setTimeout(() => window.location.reload(), 75);
        });

        this.modalElement.on('change', '[data-safe-upgrade-decision]', (event) => {
            const target = $(event.currentTarget);
            const decision = target.val();
            const type = target.data('safe-upgrade-decision');
            this.decisions[type] = decision;
            this.updateStartButtonState();
        });

        this.modalElement.on('closing', (event) => {
            if (this.modalLocked && event.reason !== 'finish') {
                event.preventDefault();
            }
        });
    }

    setPayload(payload = {}) {
        this.payload = payload;
    }

    open() {
        this.active = true;
        this.decisions = {};
        this.statusFailures = 0;
        this.preferDirectStatus = !!this.directStatusUrl;
        this.statusContext = null;
        this.statusIdleCount = 0;
        this.currentStage = null;
        this.stageEnteredAt = 0;
        this.modalLocked = false;
        this.renderLoading();
        this.modal.open();
        this.fetchPreflight();
    }

    renderLoading() {
        this.modalLocked = false;
        this.resetFooterButtons();
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
        } else {
            this.setRecheckLoading(true);
        }

        const done = () => {
            if (silent) {
                this.setRecheckLoading(false);
            }
        };

        const requestPromise = request(this.urls.preflight, (response) => {
            if (!this.active) {
                done();
                return;
            }

            if (response.status === 'error') {
                done();
                this.renderPreflightError(response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'));
                return;
            }

            this.renderPreflight(response.data || {});
            done();
        });

        if (silent && requestPromise && typeof requestPromise.catch === 'function') {
            requestPromise.catch(() => done());
        }
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

        const psrWarningItems = Object.keys(psrConflicts).map((slug) => {
            const info = psrConflicts[slug] || {};
            const requires = info.requires || '*';

            return `<li>${t('SAFE_UPGRADE_WARNINGS_PSR_ITEM', 'Potential psr/log conflict:')} <code>${slug}</code> &mdash; ${r('SAFE_UPGRADE_CONFLICTS_REQUIRES', requires, 'Requires psr/log %s')}</li>`;
        });

        const monologWarningItems = Object.keys(monologConflicts).map((slug) => {
            const entries = Array.isArray(monologConflicts[slug]) ? monologConflicts[slug] : [];
            const details = entries.map((entry) => {
                const method = entry.method || '';
                const file = entry.file ? basename(entry.file) : '';
                return `<span>${method} ${file ? `<code>${file}</code>` : ''}</span>`;
            }).join(', ');

            const description = details || t('SAFE_UPGRADE_WARNINGS_MONOLOG_UNKNOWN', 'Review the plugin for potential API changes.');

            return `<li>${t('SAFE_UPGRADE_WARNINGS_MONOLOG_ITEM', 'Potential Monolog conflict:')} <code>${slug}</code> &mdash; ${description}</li>`;
        });

        const filteredWarnings = warnings.filter((warning) => {
            const lower = (warning || '').toLowerCase();
            const isPsrRelated = lower.includes('psr/log');
            const isMonologRelated = lower.includes('monolog');
            return !isPsrRelated && !isMonologRelated;
        });

        const warningsList = filteredWarnings.length || psrWarningItems.length || monologWarningItems.length ? `
            <section class="safe-upgrade-panel safe-upgrade-panel--alert safe-upgrade-alert">
                <header class="safe-upgrade-panel__header">
                    <div class="safe-upgrade-panel__title-wrap">
                        <span class="safe-upgrade-panel__icon fa fa-exclamation-triangle" aria-hidden="true"></span>
                        <div>
                            <strong class="safe-upgrade-panel__title">${t('SAFE_UPGRADE_WARNINGS', 'Warnings')}</strong>
                            <span class="safe-upgrade-panel__subtitle">${t('SAFE_UPGRADE_WARNINGS_HINT', 'These items may require attention before continuing.')}</span>
                        </div>
                    </div>
                </header>
                <div class="safe-upgrade-panel__body">
                    <ul>
                        ${filteredWarnings.map((warning) => `<li>${warning}</li>`).join('')}
                        ${psrWarningItems.join('')}
                        ${monologWarningItems.join('')}
                    </ul>
                </div>
            </section>
        ` : '';

        const pendingList = Object.keys(pending).length ? `
            <section class="safe-upgrade-panel safe-upgrade-panel--info safe-upgrade-pending">
                <header class="safe-upgrade-panel__header">
                    <div class="safe-upgrade-panel__title-wrap">
                        <span class="safe-upgrade-panel__icon fa fa-sync" aria-hidden="true"></span>
                        <div>
                            <strong class="safe-upgrade-panel__title">${t('SAFE_UPGRADE_PENDING_UPDATES', 'Pending plugin or theme updates')}</strong>
                            <span class="safe-upgrade-panel__subtitle">${t('SAFE_UPGRADE_PENDING_INTRO', 'Review the extensions that should be updated first.')}</span>
                        </div>
                    </div>
                </header>
                <div class="safe-upgrade-panel__body">
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
            </section>
        ` : '';

        const psrList = Object.keys(psrConflicts).length ? `
            <section class="safe-upgrade-panel safe-upgrade-panel--conflict safe-upgrade-conflict">
                <header class="safe-upgrade-panel__header">
                    <div class="safe-upgrade-panel__title-wrap">
                        <span class="safe-upgrade-panel__icon fa fa-code-branch" aria-hidden="true"></span>
                        <div>
                            <strong class="safe-upgrade-panel__title">${t('SAFE_UPGRADE_CONFLICTS_PSR', 'Potential psr/log compatibility issues')}</strong>
                            <span class="safe-upgrade-panel__subtitle">${t('SAFE_UPGRADE_CONFLICTS_HINT', 'Choose how to handle conflicts before starting the upgrade.')}</span>
                        </div>
                    </div>
                    ${this.renderDecisionSelect('psr_log')}
                </header>
            </section>
        ` : '';

        const monologList = Object.keys(monologConflicts).length ? `
            <section class="safe-upgrade-panel safe-upgrade-panel--conflict safe-upgrade-conflict">
                <header class="safe-upgrade-panel__header">
                    <div class="safe-upgrade-panel__title-wrap">
                        <span class="safe-upgrade-panel__icon fa fa-wave-square" aria-hidden="true"></span>
                        <div>
                            <strong class="safe-upgrade-panel__title">${t('SAFE_UPGRADE_CONFLICTS_MONOLOG', 'Potential Monolog API compatibility issues')}</strong>
                            <span class="safe-upgrade-panel__subtitle">${t('SAFE_UPGRADE_CONFLICTS_HINT', 'Choose how to handle conflicts before starting the upgrade.')}</span>
                        </div>
                    </div>
                    ${this.renderDecisionSelect('monolog')}
                </header>
            </section>
        ` : '';

        const blockersList = blockers.length ? `
            <section class="safe-upgrade-panel safe-upgrade-panel--blocker safe-upgrade-blockers">
                <header class="safe-upgrade-panel__header">
                    <div class="safe-upgrade-panel__title-wrap">
                        <span class="safe-upgrade-panel__icon fa fa-ban" aria-hidden="true"></span>
                        <div>
                            <strong class="safe-upgrade-panel__title">${t('SAFE_UPGRADE_BLOCKERS_TITLE', 'Action required before continuing')}</strong>
                            <span class="safe-upgrade-panel__subtitle">${t('SAFE_UPGRADE_BLOCKERS_DESC', 'Resolve the following items to enable the upgrade.')}</span>
                        </div>
                    </div>
                </header>
                <div class="safe-upgrade-panel__body">
                    <ul>${blockers.map((item) => `<li>${item}</li>`).join('')}</ul>
                </div>
            </section>
        ` : '';

        const summary = `
            <section class="safe-upgrade-summary">
                <p>${r('SAFE_UPGRADE_SUMMARY_CURRENT', version.local || '?', 'Current Grav version: <strong>v%s</strong>')}</p>
                <p>${r('SAFE_UPGRADE_SUMMARY_REMOTE', version.remote || '?', 'Available Grav version: <strong>v%s</strong>')}</p>
                <p>${releaseDate ? r('SAFE_UPGRADE_RELEASED_ON', releaseDate, 'Released on %s') : ''}</p>
                <p>${r('SAFE_UPGRADE_PACKAGE_SIZE', packageSize, 'Package size: %s')}</p>
            </section>
        `;

        this.steps.preflight.html(`
            <div class="safe-upgrade-preflight">
                ${summary}
                ${warningsList}
                ${pendingList}
                ${psrList}
                ${monologList}
                ${blockersList}
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
        const currentDecision = this.decisions[type] || 'disable';
        const name = `safe-upgrade-decision-${type}`;
        const ariaLabel = t('SAFE_UPGRADE_DECISION_PROMPT', 'When conflicts are detected:');
        const options = [
            {
                value: 'disable',
                label: t('SAFE_UPGRADE_DECISION_DISABLE', 'Disable conflicting plugins'),
                description: t('SAFE_UPGRADE_DECISION_DISABLE_DESC', 'Temporarily disable conflicting plugins during the upgrade.')
            },
            {
                value: 'continue',
                label: t('SAFE_UPGRADE_DECISION_CONTINUE', 'Continue with plugins enabled'),
                description: t('SAFE_UPGRADE_DECISION_CONTINUE_DESC', 'Proceed with plugins enabled. This may require manual fixes.')
            }
        ];

        return `
            <div class="safe-upgrade-panel__action safe-upgrade-decision" role="radiogroup" aria-label="${ariaLabel}">
                ${options.map((option) => `
                    <label class="safe-upgrade-decision-option">
                        <input type="radio" name="${name}" value="${option.value}" ${currentDecision === option.value ? 'checked' : ''} data-safe-upgrade-decision="${type}">
                        <span class="safe-upgrade-decision-option__content">
                            <span class="safe-upgrade-decision-option__title">${option.label}</span>
                            <span class="safe-upgrade-decision-option__description">${option.description}</span>
                        </span>
                    </label>
                `).join('')}
            </div>
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

    setRecheckLoading(state) {
        const button = this.modalElement.find('[data-safe-upgrade-action="recheck"]');
        if (!button.length) {
            return;
        }

        const dataKey = 'safe-upgrade-recheck-label';

        if (state) {
            if (!button.data(dataKey)) {
                button.data(dataKey, button.html());
            }

            button
                .prop('disabled', true)
                .addClass('is-loading')
                .html(`
                    <span class="button-spinner fa fa-refresh fa-spin" aria-hidden="true"></span>
                    <span class="button-text">${t('SAFE_UPGRADE_RECHECKING', 'Re-running Checks...')}</span>
                `);
        } else {
            const original = button.data(dataKey);
            button
                .prop('disabled', false)
                .removeClass('is-loading');

            if (original) {
                button.html(original);
                button.removeData(dataKey);
            } else {
                button.html(t('SAFE_UPGRADE_RECHECK', 'Re-run Checks'));
            }
        }
    }

    startUpgrade() {
        this.switchStep('progress');
        this.renderProgress({
            stage: 'initializing',
            message: t('SAFE_UPGRADE_STAGE_INITIALIZING', 'Preparing upgrade'),
            percent: 0
        });

        this.buttons.start.prop('disabled', true);
        this.buttons.finish.addClass('hidden').prop('disabled', true);
        this.modalLocked = false;
        this.stopPolling();
        this.jobId = null;

        const decisionFields = {};
        Object.keys(this.decisions || {}).forEach((key) => {
            const value = this.decisions[key];
            if (value) {
                decisionFields[`decisions[${key}]`] = value;
            }
        });

        const body = decisionFields;

        request(this.urls.start, { method: 'post', body }, (response) => {
            if (!this.active) {
                return;
            }

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
            if (data.fallback) {
                this.renderResult(data);
                this.stopPolling();
                this.renderProgress({
                    stage: data.status === 'success' ? 'complete' : 'error',
                    message: data.message || t('SAFE_UPGRADE_STAGE_COMPLETE', 'Upgrade complete'),
                    percent: data.status === 'success' ? 100 : null,
                    target_version: data.version || (data.manifest && data.manifest.target_version) || null,
                    manifest: data.manifest || null
                });
                return;
            }

            if (data.status === 'queued' && data.job_id) {
                this.jobId = data.job_id;
                if (data.progress) {
                    this.renderProgress(data.progress);
                }
                this.statusFailures = 0;
                this.preferDirectStatus = !!this.directStatusUrl;
                this.statusContext = data.context || null;
                this.beginPolling(1200);
            } else {
                this.renderResult(data);
                this.stopPolling();
            }
        });
    }

    resolveDirectStatusUrl() {
        const scriptPath = '/___safe-upgrade-status';
        const join = (base, path) => {
            if (!base) {
                return path;
            }
            const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
            return `${trimmed}${path}`;
        };
        const normalize = (url) => url.replace(/([^:]\/)\/+/g, '$1');

        const candidates = [
            config.base_url_simple || '',
            (config.base_url_relative || '').replace(/\/admin\/?$/, ''),
            ''
        ];

        for (const base of candidates) {
            if (typeof base !== 'string') {
                continue;
            }
            const candidate = normalize(join(base, scriptPath));
            if (candidate) {
                return candidate;
            }
        }

        return scriptPath;
    }

    resolveStatusEndpoint() {
        const useDirect = this.directStatusUrl && this.preferDirectStatus;
        let url = useDirect ? this.directStatusUrl : this.urls.status;
        const params = [];

        if (this.jobId) {
            params.push(`job=${encodeURIComponent(this.jobId)}`);
        }

        if (this.statusContext) {
            params.push(`context=${encodeURIComponent(this.statusContext)}`);
        }

        if (params.length) {
            url += (url.includes('?') ? '&' : '?') + params.join('&');
        }

        return {
            url,
            direct: useDirect
        };
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

        this.pollTimer = setTimeout(() => this.fetchStatus(true), delay);
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
        let jobComplete = false;
        let jobFailed = false;
        let handled = false;
        let lastPayload = null;

        console.debug('[SafeUpgrade] poll status');

        const endpoint = this.resolveStatusEndpoint();
        const statusUrl = endpoint.url;
        const usingDirect = endpoint.direct;
        const requestOptions = { silentErrors: true };

        this.statusRequest = request(statusUrl, requestOptions, (response) => {
            console.debug('[SafeUpgrade] status response', response);

            if (!response) {
                this.statusFailures += 1;
                return;
            }

            handled = true;
            this.statusFailures = 0;

            if (response.status === 'error') {
                if (!silent) {
                    this.renderProgress({
                        stage: 'error',
                        message: response.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.'),
                        percent: null
                    });
                }
                nextStage = 'error';
                jobFailed = true;
                return;
            }

            const payload = response.data || {};
            lastPayload = payload;
            if (Object.prototype.hasOwnProperty.call(payload, 'context')) {
                this.statusContext = payload.context || null;
            }
            const job = payload.job || {};
            const data = payload.progress || payload;
            nextStage = data.stage || null;

            if (!job || !Object.keys(job).length) {
                this.statusIdleCount += 1;
            } else {
                this.statusIdleCount = 0;
            }

            this.renderProgress(data, job);

            if (job.status === 'error') {
                nextStage = 'error';
                const message = job.error || data.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.');
                this.renderProgress({
                    stage: 'error',
                    message,
                    percent: null
                }, job);
                jobFailed = true;
            } else if (job.status === 'success') {
                if (data.stage !== 'complete') {
                    const completePayload = {
                        stage: 'complete',
                        message: t('SAFE_UPGRADE_STAGE_COMPLETE', 'Upgrade complete'),
                        percent: 100,
                        target_version: (job.result && job.result.version) || data.target_version || null,
                        manifest: (job.result && job.result.manifest) || data.manifest || null
                    };

                    this.renderProgress(completePayload, job);
                    nextStage = 'complete';
                }
                jobComplete = true;
            } else if (!job.status && data.stage === 'complete') {
                jobComplete = true;
            }
        });

        const finalize = () => {
            this.statusRequest = null;

            if (!this.isPolling) {
                return;
            }

            if (!handled) {
                if (usingDirect && this.statusFailures >= 3) {
                    this.preferDirectStatus = false;
                    this.statusFailures = 0;
                    this.statusIdleCount = 0;
                    this.schedulePoll();
                } else {
                    const delay = Math.min(5000, 1200 * Math.max(1, this.statusFailures));
                    this.schedulePoll(delay);
                }
            } else if ((!lastPayload || !lastPayload.job || !Object.keys(lastPayload.job).length) && usingDirect && this.statusIdleCount >= 5) {
                this.preferDirectStatus = false;
                this.statusFailures = 0;
                this.statusIdleCount = 0;
                this.schedulePoll();
            } else if (jobFailed) {
                this.stopPolling();
                this.jobId = null;
            } else if (jobComplete || nextStage === 'complete') {
                this.stopPolling();
                this.jobId = null;
            } else {
                this.schedulePoll();
            }
        };

        this.statusRequest.then(finalize, finalize);
    }

    renderProgress(data, job = {}) {
        if (!data) {
            return;
        }

        const stage = data.stage || 'initializing';
        if (stage !== this.currentStage) {
            this.currentStage = stage;
            this.stageEnteredAt = Date.now();
        }

        const titleResolver = STAGE_TITLES[stage] || STAGE_TITLES.initializing;
        const title = titleResolver();
        let percent = typeof data.percent === 'number' ? data.percent : null;

        const scaledPercent = () => {
            if (stage === 'queued') { return 0; }
            if (stage === 'initializing') { return percent !== null ? Math.min(percent, 5) : 5; }
            if (stage === 'downloading') {
                if (percent !== null) {
                    return Math.min(20, Math.max(5, Math.round(percent * 0.2)));
                }
                return 12;
            }
            if (stage === 'installing') {
                return this.computeSmoothPercent(20, 90, 28, percent);
            }
            if (stage === 'finalizing') {
                return this.computeSmoothPercent(90, 99, 6, percent);
            }
            if (stage === 'complete') { return 100; }
            if (stage === 'error') { return null; }
            return percent;
        };

        percent = scaledPercent();
        const displayPercent = percent !== null ? Math.round(percent) : null;
        const percentLabel = displayPercent !== null ? `${displayPercent}%` : '';

        const statusLine = job && job.status ? `<p class="safe-upgrade-status">${t('SAFE_UPGRADE_JOB_STATUS', 'Status')}: <strong>${job.status.toUpperCase()}</strong>${job.error ? ` &mdash; ${job.error}` : ''}</p>` : '';
        const animateBar = stage !== 'complete' && stage !== 'error' && percent !== null;
        const barClass = `safe-upgrade-progress-bar${animateBar ? ' is-active' : ''}`;
        const detailMessage = stage === 'error'
            ? `<p>${data.message || ''}</p>`
            : (data.message && stage !== 'installing' && stage !== 'finalizing' ? `<p>${data.message}</p>` : '');

        this.steps.progress.html(`
            <div class="safe-upgrade-progress">
                <h3>${title}</h3>
                ${detailMessage}
                ${statusLine}
                ${percentLabel ? `<div class="${barClass}"><span style="width:${percent}%"></span></div><div class="progress-value">${percentLabel}</div>` : ''}
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
            const identifier = manifest.id || '';

            this.steps.result.html(`
                <div class="safe-upgrade-result success">
                    <h3>${r('SAFE_UPGRADE_RESULT_SUCCESS', target, 'Grav upgraded to v%s')}</h3>
                    ${identifier ? `<p>${r('SAFE_UPGRADE_RESULT_MANIFEST', identifier, 'Snapshot reference: <code>%s</code>')}</p>` : ''}
                    <p>${t('SAFE_UPGRADE_RESULT_HINT', 'Restore snapshots from Tools → Restore Grav.')}</p>
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

            this.prepareCompletionFooter();
        } else if (status === 'noop') {
            this.steps.result.html(`
                <div class="safe-upgrade-result neutral">
                    <h3>${t('SAFE_UPGRADE_RESULT_NOOP', 'Grav is already up to date.')}</h3>
                </div>
            `);
            this.switchStep('result');
            this.prepareCompletionFooter();
        } else {
            this.steps.result.html(`
                <div class="safe-upgrade-result error">
                    <h3>${t('SAFE_UPGRADE_RESULT_FAILURE', 'Safe upgrade failed')}</h3>
                    <p>${result.message || t('SAFE_UPGRADE_GENERIC_ERROR', 'Safe upgrade could not complete. See Grav logs for details.')}</p>
                </div>
            `);
            this.switchStep('result');
            this.modalLocked = false;
            this.buttons.finish.addClass('hidden').prop('disabled', true);
            this.buttons.cancel.removeClass('hidden').prop('disabled', false);
            this.buttons.recheck.removeClass('hidden').prop('disabled', false);
        }
    }

    switchStep(step) {
        Object.keys(this.steps).forEach((handle) => {
            const isActive = handle === step;
            this.steps[handle].toggle(isActive);
            this.steps[handle].toggleClass('hidden', !isActive);
        });
    }

    resetFooterButtons() {
        this.buttons.cancel.removeClass('hidden').prop('disabled', false);
        this.buttons.recheck.removeClass('hidden').prop('disabled', false);
        this.buttons.finish.addClass('hidden').prop('disabled', true);
    }

    prepareCompletionFooter() {
        this.modalLocked = true;
        this.buttons.cancel.addClass('hidden').prop('disabled', true);
        this.buttons.recheck.addClass('hidden').prop('disabled', true);
        this.buttons.start.addClass('hidden').prop('disabled', true);
        this.buttons.finish.removeClass('hidden').prop('disabled', false);
    }

    stopPolling() {
        this.isPolling = false;
        this.clearPollTimer();
    }

    computeSmoothPercent(base, target, durationSeconds, actualPercent) {
        const span = target - base;
        if (span <= 0) {
            return actualPercent !== null ? Math.min(Math.max(actualPercent, base), target) : base;
        }

        const elapsed = Math.max(0, (Date.now() - this.stageEnteredAt) / 1000);
        const progressRatio = Math.min(1, elapsed / Math.max(durationSeconds, 1));
        let smooth = base + (progressRatio * span);

        if (actualPercent !== null && !Number.isNaN(actualPercent)) {
            smooth = Math.max(smooth, Math.min(actualPercent, target));
        }

        return Math.min(smooth, target);
    }
}

function basename(path) {
    if (!path) { return ''; }
    return path.split(/[\\/]/).pop();
}
