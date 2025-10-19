import $ from 'jquery';
import { config, translations } from 'grav-config';
import request from '../utils/request';
import toastr from '../utils/toastr';

const paramSep = config.param_sep;
const task = `task${paramSep}`;
const nonce = `admin-nonce${paramSep}${config.admin_nonce}`;
const base = `${config.base_url_relative}/update.json`;

const urls = {
    restore: `${base}/${task}safeUpgradeRestore/${nonce}`,
    snapshot: `${base}/${task}safeUpgradeSnapshot/${nonce}`,
    status: `${base}/${task}safeUpgradeStatus/${nonce}`,
};

const NICETIME_PERIODS_SHORT = [
    'NICETIME.SEC',
    'NICETIME.MIN',
    'NICETIME.HR',
    'NICETIME.DAY',
    'NICETIME.WK',
    'NICETIME.MO',
    'NICETIME.YR',
    'NICETIME.DEC'
];

const NICETIME_PERIODS_LONG = [
    'NICETIME.SECOND',
    'NICETIME.MINUTE',
    'NICETIME.HOUR',
    'NICETIME.DAY',
    'NICETIME.WEEK',
    'NICETIME.MONTH',
    'NICETIME.YEAR',
    'NICETIME.DECADE'
];

const NICETIME_LENGTHS = [60, 60, 24, 7, 4.35, 12, 10];
const FAST_UPDATE_THRESHOLD_SECONDS = 60;
const FAST_REFRESH_INTERVAL_MS = 1000;
const SLOW_REFRESH_INTERVAL_MS = 60000;
const NICETIME_TRANSLATION_ROOTS = ['GRAV_CORE', 'GRAV'];

const NICETIME_BASE_FALLBACKS = {
    SECOND: 'second',
    MINUTE: 'minute',
    HOUR: 'hour',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    DECADE: 'decade',
    SEC: 'sec',
    MIN: 'min',
    HR: 'hr',
    WK: 'wk',
    MO: 'mo',
    YR: 'yr',
    DEC: 'dec'
};

const NICETIME_PLURAL_FALLBACKS = {
    SECOND: 'seconds',
    MINUTE: 'minutes',
    HOUR: 'hours',
    DAY: 'days',
    WEEK: 'weeks',
    MONTH: 'months',
    YEAR: 'years',
    DECADE: 'decades',
    SEC: 'secs',
    MIN: 'mins',
    HR: 'hrs',
    WK: 'wks',
    MO: 'mos',
    YR: 'yrs',
    DEC: 'decs'
};

const getTranslationKey = (key) => {
    for (const root of NICETIME_TRANSLATION_ROOTS) {
        const catalog = translations[root];
        if (catalog && Object.prototype.hasOwnProperty.call(catalog, key)) {
            const value = catalog[key];
            if (typeof value === 'string' && value.trim() !== '') {
                return value;
            }
        }
    }

    return undefined;
};

const nicetimeHasKey = (key) => typeof getTranslationKey(key) === 'string';

const nicetimeTranslate = (key, fallback) => {
    const value = getTranslationKey(key);
    if (typeof value === 'string' && value.length) {
        return value;
    }

    return fallback;
};

const getFallbackForPeriodKey = (key) => {
    const normalized = key.replace(/^GRAV\./, '');
    const period = normalized.replace(/^NICETIME\./, '');
    const plural = /_PLURAL/.test(period);
    const baseKey = period.replace(/_PLURAL(_MORE_THAN_TWO)?$/, '');
    const base = NICETIME_BASE_FALLBACKS[baseKey] || baseKey.toLowerCase();

    if (!plural) {
        return base;
    }

    const pluralKey = NICETIME_PLURAL_FALLBACKS[baseKey];
    if (pluralKey) {
        return pluralKey;
    }

    if (base.endsWith('y')) {
        return `${base.slice(0, -1)}ies`;
    }

    if (base.endsWith('s')) {
        return `${base}es`;
    }

    return `${base}s`;
};

const parseTimestampValue = (input) => {
    if (input instanceof Date) {
        return Math.floor(input.getTime() / 1000);
    }

    if (typeof input === 'number' && Number.isFinite(input)) {
        return input > 1e12 ? Math.floor(input / 1000) : Math.floor(input);
    }

    if (typeof input === 'string') {
        const trimmed = input.trim();
        if (!trimmed) {
            return null;
        }

        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric) && trimmed === String(numeric)) {
            return numeric > 1e12 ? Math.floor(numeric / 1000) : Math.floor(numeric);
        }

        const parsed = Date.parse(trimmed);
        if (!Number.isNaN(parsed)) {
            return Math.floor(parsed / 1000);
        }
    }

    return null;
};

const computeNicetime = (input, { longStrings = false, showTense = false } = {}) => {
    if (input === null || input === undefined || input === '') {
        return nicetimeTranslate('NICETIME.NO_DATE_PROVIDED', 'No date provided');
    }

    const unixDate = parseTimestampValue(input);
    if (unixDate === null) {
        return nicetimeTranslate('NICETIME.BAD_DATE', 'Bad date');
    }

    const now = Math.floor(Date.now() / 1000);
    const periods = (longStrings ? NICETIME_PERIODS_LONG : NICETIME_PERIODS_SHORT).slice();

    let difference;
    let tense;

    if (now > unixDate) {
        difference = now - unixDate;
        tense = nicetimeTranslate('NICETIME.AGO', 'ago');
    } else if (now === unixDate) {
        difference = 0;
        tense = nicetimeTranslate('NICETIME.JUST_NOW', 'just now');
    } else {
        difference = unixDate - now;
        tense = nicetimeTranslate('NICETIME.FROM_NOW', 'from now');
    }

    if (now === unixDate) {
        return tense;
    }

    let index = 0;
    while (index < NICETIME_LENGTHS.length - 1 && difference >= NICETIME_LENGTHS[index]) {
        difference /= NICETIME_LENGTHS[index];
        index += 1;
    }

    difference = Math.round(difference);
    let periodKey = periods[index];

    if (difference !== 1) {
        periodKey += '_PLURAL';
        const moreThanTwoKey = `${periodKey}_MORE_THAN_TWO`;
        if (difference > 2 && nicetimeHasKey(moreThanTwoKey)) {
            periodKey = moreThanTwoKey;
        }
    }

    const labelFallback = periodKey.split('.').pop().toLowerCase();
    const fallbackLabel = getFallbackForPeriodKey(periodKey) || labelFallback;
    const periodLabel = nicetimeTranslate(periodKey, fallbackLabel);
    const timeString = `${difference} ${periodLabel}`;

    return showTense ? `${timeString} ${tense}` : timeString;
};

const parseBoolAttribute = (element, attributeName, defaultValue = false) => {
    const rawValue = element.getAttribute(attributeName);
    if (rawValue === null) {
        return defaultValue;
    }

    const normalized = rawValue.trim().toLowerCase();
    if (normalized === '') {
        return true;
    }

    return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const initialiseNicetimeUpdater = () => {
    const selector = '[data-nicetime-timestamp]';
    if (!document.querySelector(selector)) {
        return null;
    }

    const update = () => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        let youngestAge = Infinity;

        document.querySelectorAll(selector).forEach((element) => {
            const timestamp = element.getAttribute('data-nicetime-timestamp');
            const longStrings = parseBoolAttribute(element, 'data-nicetime-long', false);
            const showTense = parseBoolAttribute(element, 'data-nicetime-tense', false);
            const unixTimestamp = parseTimestampValue(timestamp);
            if (unixTimestamp !== null) {
                const age = Math.max(0, nowSeconds - unixTimestamp);
                if (age < youngestAge) {
                    youngestAge = age;
                }
            }

            const updated = computeNicetime(timestamp, { longStrings, showTense });

            if (updated && element.textContent !== updated) {
                element.textContent = updated;
            }
        });

        return youngestAge;
    };

    let timerId = null;

    const scheduleNext = (lastAge) => {
        const useFastInterval = Number.isFinite(lastAge) && lastAge < FAST_UPDATE_THRESHOLD_SECONDS;
        const delay = useFastInterval ? FAST_REFRESH_INTERVAL_MS : SLOW_REFRESH_INTERVAL_MS;

        timerId = window.setTimeout(() => {
            const nextAge = update();
            scheduleNext(nextAge);
        }, delay);
    };

    const destroy = () => {
        if (timerId !== null) {
            window.clearTimeout(timerId);
            timerId = null;
        }
    };

    const initialAge = update();
    scheduleNext(initialAge);

    window.addEventListener('beforeunload', destroy, { once: true });

    return { update, destroy };
};

class RestoreManager {
    constructor() {
        this.job = null;
        this.pollTimer = null;
        this.pollFailures = 0;

        $(document).on('click', '[data-restore-snapshot]', (event) => {
            event.preventDefault();
            const button = $(event.currentTarget);
            if (this.job) {
                return;
            }
            this.startRestore(button);
        });

        $(document).on('click', '[data-create-snapshot]', (event) => {
            event.preventDefault();
            const button = $(event.currentTarget);
            if (this.job) {
                return;
            }
            this.startSnapshot(button);
        });
    }

    startSnapshot(button) {
        let label = null;
        if (typeof window !== 'undefined' && window.prompt) {
            const promptMessage = translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_PROMPT || 'Enter an optional snapshot label';
            const input = window.prompt(promptMessage, '');
            if (input === null) {
                return;
            }
            label = input.trim();
            if (label === '') {
                label = null;
            }
        }

        button.prop('disabled', true).addClass('is-loading');

        const body = {};
        if (label) {
            body.label = label;
        }

        request(urls.snapshot, { method: 'post', body }, (response) => {
            button.prop('disabled', false).removeClass('is-loading');

            if (!response) {
                toastr.error(translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_FAILED || 'Snapshot creation failed.');
                return;
            }

            if (response.status === 'error') {
                toastr.error(response.message || translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_FAILED || 'Snapshot creation failed.');
                return;
            }

            const data = response.data || {};
            const jobId = data.job_id || (data.job && data.job.id);
            if (!jobId) {
                const message = response.message || translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_FAILED || 'Snapshot creation failed.';
                toastr.error(message);
                return;
            }

            this.job = {
                id: jobId,
                operation: 'snapshot',
                snapshot: null,
                label
            };
            this.pollFailures = 0;

            const descriptor = label || jobId;
            const runningMessage = translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_RUNNING
                ? translations.PLUGIN_ADMIN.RESTORE_GRAV_SNAPSHOT_RUNNING.replace('%s', descriptor)
                : 'Creating snapshot...';
            toastr.info(runningMessage);
            this.schedulePoll();
        });
    }

    startRestore(button) {
        const snapshot = button.data('restore-snapshot');
        if (!snapshot) {
            return;
        }

        button.prop('disabled', true).addClass('is-loading');

        const body = { snapshot };
        request(urls.restore, { method: 'post', body }, (response) => {
            button.prop('disabled', false).removeClass('is-loading');

            if (!response) {
                toastr.error(translations.PLUGIN_ADMIN?.RESTORE_GRAV_FAILED || 'Snapshot restore failed.');
                return;
            }

            if (response.status === 'error') {
                toastr.error(response.message || translations.PLUGIN_ADMIN?.RESTORE_GRAV_FAILED || 'Snapshot restore failed.');
                return;
            }

            const data = response.data || {};
            const jobId = data.job_id || (data.job && data.job.id);
            if (!jobId) {
                const message = response.message || translations.PLUGIN_ADMIN?.RESTORE_GRAV_FAILED || 'Snapshot restore failed.';
                toastr.error(message);
                return;
            }

            this.job = {
                id: jobId,
                snapshot,
                operation: 'restore',
            };
            this.pollFailures = 0;

            const runningMessage = translations.PLUGIN_ADMIN?.RESTORE_GRAV_RUNNING
                ? translations.PLUGIN_ADMIN.RESTORE_GRAV_RUNNING.replace('%s', snapshot)
                : `Restoring snapshot ${snapshot}...`;
            toastr.info(runningMessage);
            this.schedulePoll();
        });
    }

    schedulePoll(delay = 1200) {
        this.clearPoll();
        this.pollTimer = setTimeout(() => this.pollStatus(), delay);
    }

    clearPoll() {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    pollStatus() {
        if (!this.job) {
            return;
        }

        const jobId = this.job.id;
        let handled = false;

        request(`${urls.status}?job=${encodeURIComponent(jobId)}`, { silentErrors: true }, (response) => {
            handled = true;
            this.pollFailures = 0;

            if (!response || response.status !== 'success') {
                this.schedulePoll();
                return;
            }

            const data = response.data || {};
            const job = data.job || {};
            const progress = data.progress || {};

            const stage = progress.stage || null;
            const status = job.status || progress.status || null;
            const operation = progress.operation || this.job.operation || null;

            if (!this.job.snapshot && progress.snapshot) {
                this.job.snapshot = progress.snapshot;
            } else if (!this.job.snapshot && job.result && job.result.snapshot) {
                this.job.snapshot = job.result.snapshot;
            }

            if (!this.job.label && progress.label) {
                this.job.label = progress.label;
            } else if (!this.job.label && job.result && job.result.label) {
                this.job.label = job.result.label;
            }

            if (stage === 'error' || status === 'error') {
                const message = job.error || progress.message || (operation === 'snapshot'
                    ? translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_FAILED || 'Snapshot creation failed.'
                    : translations.PLUGIN_ADMIN?.RESTORE_GRAV_FAILED || 'Snapshot restore failed.');
                toastr.error(message);
                this.job = null;
                this.clearPoll();
                return;
            }

            if (stage === 'complete' || status === 'success') {
                if (operation === 'snapshot') {
                    const snapshotId = progress.snapshot || (job.result && job.result.snapshot) || this.job.snapshot || '';
                    const labelValue = progress.label || (job.result && job.result.label) || this.job.label || '';
                    let displayName = labelValue || snapshotId || (translations.PLUGIN_ADMIN?.RESTORE_GRAV_TABLE_SNAPSHOT || 'snapshot');
                    if (labelValue && snapshotId && labelValue !== snapshotId) {
                        displayName = `${labelValue} (${snapshotId})`;
                    }
                    const successMessage = translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_SUCCESS
                        ? translations.PLUGIN_ADMIN.RESTORE_GRAV_SNAPSHOT_SUCCESS.replace('%s', displayName)
                        : (snapshotId ? `Snapshot ${displayName} created.` : 'Snapshot created.');
                    toastr.success(successMessage);
                    this.job = null;
                    this.clearPoll();
                    setTimeout(() => window.location.reload(), 1500);
                    return;
                }

                const snapshotId = progress.snapshot || this.job.snapshot || '';
                const labelValue = progress.label || (job.result && job.result.label) || this.job.label || '';
                let snapshotDisplay = snapshotId || labelValue;
                if (labelValue && snapshotId && labelValue !== snapshotId) {
                    snapshotDisplay = `${labelValue} (${snapshotId})`;
                } else if (!snapshotDisplay) {
                    snapshotDisplay = translations.PLUGIN_ADMIN?.RESTORE_GRAV_TABLE_SNAPSHOT || 'snapshot';
                }
                const version = (job.result && job.result.version) || progress.version || '';
                let successMessage;
                if (translations.PLUGIN_ADMIN?.RESTORE_GRAV_SUCCESS_MESSAGE && version) {
                    successMessage = translations.PLUGIN_ADMIN.RESTORE_GRAV_SUCCESS_MESSAGE.replace('%1$s', snapshotDisplay).replace('%2$s', version);
                } else if (translations.PLUGIN_ADMIN?.RESTORE_GRAV_SUCCESS_SIMPLE) {
                    successMessage = translations.PLUGIN_ADMIN.RESTORE_GRAV_SUCCESS_SIMPLE.replace('%s', snapshotDisplay);
                } else {
                    successMessage = version ? `Snapshot ${snapshotDisplay} restored (Grav ${version}).` : `Snapshot ${snapshotDisplay} restored.`;
                }
                toastr.success(successMessage);
                this.job = null;
                this.clearPoll();
                setTimeout(() => window.location.reload(), 1500);
                return;
            }

            this.schedulePoll();
        }).then(() => {
            if (!handled) {
                this.handleSilentFailure();
            }
        });
    }

    handleSilentFailure() {
        if (!this.job) {
            return;
        }

        this.pollFailures += 1;
        const operation = this.job.operation || 'restore';
        const snapshot = this.job.snapshot || '';

        if (this.pollFailures >= 3) {
            let message;
            if (operation === 'snapshot') {
                message = translations.PLUGIN_ADMIN?.RESTORE_GRAV_SNAPSHOT_FALLBACK || 'Snapshot creation may have completed. Reloading...';
            } else {
                message = snapshot
                    ? `Snapshot ${snapshot} restore is completing. Reloading...`
                    : 'Snapshot restore is completing. Reloading...';
            }
            toastr.info(message);
            this.job = null;
            this.clearPoll();
            setTimeout(() => window.location.reload(), 1500);

            return;
        }

        const delay = Math.min(5000, 1200 * this.pollFailures);
        this.schedulePoll(delay);
    }
}

// Initialize restore manager when tools view loads.
$(document).ready(() => {
    initialiseNicetimeUpdater();
    new RestoreManager();
});
