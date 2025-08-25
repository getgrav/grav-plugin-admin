/**
 * Scheduler Admin JavaScript
 * Handles dynamic loading of scheduler status in admin panel
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on the scheduler config page
        const healthStatusEl = document.getElementById('scheduler-health-status');
        const triggersEl = document.getElementById('scheduler-triggers');
        
        if (!healthStatusEl && !triggersEl) {
            return; // Not on scheduler page
        }
        
        // Load scheduler status
        loadSchedulerStatus();
        
        // Refresh every 30 seconds if page is visible
        let refreshInterval = setInterval(function() {
            if (!document.hidden) {
                loadSchedulerStatus();
            }
        }, 30000);
        
        // Clean up interval when leaving page
        window.addEventListener('beforeunload', function() {
            clearInterval(refreshInterval);
        });
    });
    
    /**
     * Load scheduler status via AJAX
     */
    function loadSchedulerStatus() {
        const healthStatusEl = document.getElementById('scheduler-health-status');
        const triggersEl = document.getElementById('scheduler-triggers');
        
        // Get the admin base URL
        const adminBase = GravAdmin ? GravAdmin.config.base_url_relative : '/admin';
        const nonce = GravAdmin ? GravAdmin.config.admin_nonce : '';
        
        // Make AJAX request
        fetch(adminBase + '/scheduler/status', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Admin-Nonce': nonce
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update health status
            if (healthStatusEl && data.health) {
                healthStatusEl.innerHTML = data.health;
                healthStatusEl.classList.remove('text-muted');
            }
            
            // Update triggers
            if (triggersEl && data.triggers) {
                triggersEl.innerHTML = data.triggers;
                triggersEl.classList.remove('text-muted');
            }
        })
        .catch(error => {
            console.error('Error loading scheduler status:', error);
            
            // Show error message
            if (healthStatusEl) {
                healthStatusEl.innerHTML = '<div class="alert alert-danger">Failed to load status</div>';
            }
            if (triggersEl) {
                triggersEl.innerHTML = '<div class="alert alert-danger">Failed to load triggers</div>';
            }
        });
    }
    
    /**
     * Test scheduler webhook
     */
    window.testSchedulerWebhook = function() {
        const token = document.querySelector('input[name="data[scheduler][modern][webhook][token]"]')?.value;
        
        if (!token) {
            alert('Please set a webhook token first');
            return;
        }
        
        const siteUrl = window.location.origin;
        const webhookUrl = siteUrl + '/scheduler/webhook';
        
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