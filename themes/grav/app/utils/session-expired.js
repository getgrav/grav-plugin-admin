import $ from 'jquery';
import { config } from 'grav-config';
import KeepAlive from './keepalive';

let shown = false;

export function showSessionExpiredModal() {
    if (shown) { return; }
    shown = true;

    try { localStorage.setItem('grav:admin:sessionExpiredShown', '1'); } catch (e) {}
    try { KeepAlive.stop(); } catch (e) {}

    // Ensure modal exists (in case a custom layout removed it)
    let $modal = $('[data-remodal-id="session-expired"]');
    if (!$modal.length) {
        const html = `
            <div class="remodal" data-remodal-id="session-expired" data-remodal-options="hashTracking: false">
                <form>
                    <h1>Session Expired</h1>
                    <p class="bigger">Your admin login session has expired. Please log in again.</p>
                    <div class="button-bar">
                        <a class="button remodal-confirm" data-remodal-action="confirm" href="#">OK</a>
                    </div>
                </form>
            </div>`;
        $('body').append(html);
        $modal = $('[data-remodal-id="session-expired"]');
    }

    // Harden the modal: no escape/overlay close
    const instance = $modal.remodal({ hashTracking: false, closeOnEscape: false, closeOnOutsideClick: false, closeOnCancel: false, closeOnConfirm: true, stack: false });

    // Style overlay + blur background
    $('html').addClass('session-expired-active');
    $('.remodal-overlay').addClass('session-expired');

    // On confirm, redirect to login
    $modal.off('.session-expired').on('confirmation.session-expired', () => {
        // Keep suppression flag for the next page load (login) so we don't double prompt
        window.location.href = config.base_url_relative;
    });

    // Open modal
    instance.open();
}

// Bind a jQuery global ajax error trap for legacy XHR paths
export function bindGlobalAjaxTrap() {
    $(document).off('ajaxError._grav_session').on('ajaxError._grav_session', (event, xhr) => {
        if (!xhr) { return; }
        const status = xhr.status || 0;
        if (status === 401 || status === 403) {
            showSessionExpiredModal();
        }
    });
}

// Intercept in-admin link clicks to show the modal before any server redirect to login
export function installNavigationGuard() {
    $(document).off('click._grav_session_nav').on('click._grav_session_nav', 'a[href]', function(e) {
        const $a = $(this);
        const href = $a.attr('href');
        if (!href || href === '#' || href.indexOf('javascript:') === 0) { return; }
        if (e.isDefaultPrevented()) { return; }
        if ($a.attr('target') === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }

        // Only guard admin-relative links
        const base = (window.GravAdmin && window.GravAdmin.config && window.GravAdmin.config.base_url_relative) || '';
        const isAdminLink = href.indexOf(base + '/') === 0 || href === base || href.indexOf('/') === 0;
        if (!isAdminLink) { return; }

        e.preventDefault();

        // Quick session check, if invalid show modal, else proceed with navigation
        try {
            KeepAlive.checkOnce().then((ok) => {
                if (ok) {
                    window.location.href = href;
                } else {
                    showSessionExpiredModal();
                }
            });
        } catch (err) {
            // On any error, just navigate
            window.location.href = href;
        }
    });
}

export default { showSessionExpiredModal, bindGlobalAjaxTrap };
