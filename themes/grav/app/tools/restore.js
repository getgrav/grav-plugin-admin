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
    status: `${base}/${task}safeUpgradeStatus/${nonce}`,
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

            if (stage === 'error' || status === 'error') {
                const message = job.error || progress.message || translations.PLUGIN_ADMIN?.RESTORE_GRAV_FAILED || 'Snapshot restore failed.';
                toastr.error(message);
                this.job = null;
                this.clearPoll();
                return;
            }

            if (stage === 'complete' || status === 'success') {
                const snapshot = progress.snapshot || this.job.snapshot;
                const version = (job.result && job.result.version) || progress.version || '';
                let successMessage;
                if (translations.PLUGIN_ADMIN?.RESTORE_GRAV_SUCCESS_MESSAGE && version) {
                    successMessage = translations.PLUGIN_ADMIN.RESTORE_GRAV_SUCCESS_MESSAGE.replace('%1$s', snapshot).replace('%2$s', version);
                } else if (translations.PLUGIN_ADMIN?.RESTORE_GRAV_SUCCESS_SIMPLE) {
                    successMessage = translations.PLUGIN_ADMIN.RESTORE_GRAV_SUCCESS_SIMPLE.replace('%s', snapshot);
                } else {
                    successMessage = version ? `Snapshot ${snapshot} restored (Grav ${version}).` : `Snapshot ${snapshot} restored.`;
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
        const snapshot = this.job.snapshot || '';

        if (this.pollFailures >= 3) {
            const message = snapshot
                ? `Snapshot ${snapshot} restore is completing. Reloading...`
                : 'Snapshot restore is completing. Reloading...';
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
    new RestoreManager();
});
