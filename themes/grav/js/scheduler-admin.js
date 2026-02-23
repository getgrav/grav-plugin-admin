/**
 * Scheduler Admin JavaScript
 * Handles dynamic loading of scheduler status in admin panel
 */

(function() {
    'use strict';

    /**
     * Test scheduler webhook
     */
    window.testSchedulerWebhook = function() {
        const token = document.querySelector('input[name="data[scheduler][modern][webhook][token]"]')?.value;

        if (!token) {
            alert('Please set a webhook token first');
            return;
        }

        const baseUrl = window.schedulerBaseUrl || window.location.origin;
        const webhookUrl = baseUrl + '/scheduler/webhook';

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Webhook test successful! Jobs run: ' + (data.jobs_run || 0));
            } else {
                alert('Webhook test failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            alert('Webhook test error: ' + error.message);
        });
    };

    /**
     * Generate secure token
     */
    window.generateSchedulerToken = function() {
        const tokenField = document.querySelector('input[name="data[scheduler][modern][webhook][token]"]');

        if (!tokenField) {
            return;
        }

        // Generate random token (32 bytes = 64 hex chars)
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        tokenField.value = token;

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        tokenField.dispatchEvent(event);
    };

})();