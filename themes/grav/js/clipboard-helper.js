/**
 * Clipboard Helper for Grav Admin
 * Provides copy-to-clipboard functionality with visual feedback
 */

window.GravClipboard = {
    /**
     * Copy the value from an input/textarea element with visual feedback
     * @param {HTMLElement} buttonElement - The button element that was clicked
     * @param {string} inputId - Optional ID of input to copy from (if not previous sibling)
     */
    copy: function(buttonElement, inputId) {
        var input;
        
        if (inputId) {
            input = document.getElementById(inputId);
        } else {
            input = buttonElement.previousElementSibling;
        }
        
        if (!input) {
            console.error('No input element found to copy from');
            return;
        }
        
        // Select and copy the text
        input.select();
        var success = document.execCommand('copy');
        
        if (success) {
            // Store original content
            var originalHTML = buttonElement.innerHTML;
            
            // Show success feedback
            buttonElement.innerHTML = '<i class="fa fa-check"></i> Copied!';
            
            // Restore original content after delay
            setTimeout(function() {
                buttonElement.innerHTML = originalHTML;
            }, 2000);
        } else {
            console.error('Failed to copy to clipboard');
        }
    },
    
    /**
     * Update webhook commands with actual token and URL values
     * @param {string} tokenFieldSelector - Selector for the token input field
     */
    updateWebhookCommands: function(tokenFieldSelector) {
        tokenFieldSelector = tokenFieldSelector || '[name="data[scheduler][modern][webhook][token]"]';
        
        // Try multiple ways to get the token field
        var tokenField = document.querySelector(tokenFieldSelector);
        if (!tokenField) {
            tokenField = document.querySelector('input[name*="webhook][token"]');
        }
        if (!tokenField) {
            // Look for the token input by searching in the webhook section
            var inputs = document.querySelectorAll('input[type="text"]');
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].name && inputs[i].name.includes('webhook') && inputs[i].name.includes('token')) {
                    tokenField = inputs[i];
                    break;
                }
            }
        }
        
        var token = (tokenField && tokenField.value && tokenField.value.trim()) ? tokenField.value.trim() : 'YOUR_TOKEN';
        var siteUrl = window.location.origin + window.location.pathname.replace(/\/admin.*$/, '');
        
        // Update webhook commands with actual values (URLs quoted for shell compatibility)
        var webhookAllCmd = 'curl -X POST "' + siteUrl + '/scheduler/webhook" \\\n  -H "Authorization: Bearer ' + token + '"';
        var webhookJobCmd = 'curl -X POST "' + siteUrl + '/scheduler/webhook?job=backup" \\\n  -H "Authorization: Bearer ' + token + '"';
        var healthCmd = 'curl "' + siteUrl + '/scheduler/health"';
        
        // Set values in input fields if they exist
        var allInput = document.getElementById('webhook-all-cmd');
        var jobInput = document.getElementById('webhook-job-cmd');
        var healthInput = document.getElementById('webhook-health-cmd');
        
        if (allInput) allInput.value = webhookAllCmd;
        if (jobInput) jobInput.value = webhookJobCmd;
        if (healthInput) healthInput.value = healthCmd;
        
        return {
            token: token,
            siteUrl: siteUrl,
            webhookAllCmd: webhookAllCmd,
            webhookJobCmd: webhookJobCmd,
            healthCmd: healthCmd
        };
    },
    
    /**
     * Initialize webhook command updates and listeners
     */
    initWebhookCommands: function() {
        var self = this;
        
        // Update on page load
        self.updateWebhookCommands();
        
        // Also update when token field changes
        setTimeout(function() {
            var tokenField = document.querySelector('[name="data[scheduler][modern][webhook][token]"]');
            if (!tokenField) {
                tokenField = document.querySelector('input[name*="webhook][token"]');
            }
            if (tokenField) {
                tokenField.addEventListener('change', function() { self.updateWebhookCommands(); });
                tokenField.addEventListener('input', function() { self.updateWebhookCommands(); });
            }
        }, 500);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('webhook-all-cmd')) {
            GravClipboard.initWebhookCommands();
        }
    });
} else {
    if (document.getElementById('webhook-all-cmd')) {
        GravClipboard.initWebhookCommands();
    }
}