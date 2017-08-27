---
title: Admin Login

form:
    name: login
    action:
    method: post

    fields:
        username:
            type: text
            placeholder: PLUGIN_ADMIN.USERNAME_EMAIL
            autofocus: true
            validate:
                required: true

        password:
            type: password
            placeholder: PLUGIN_ADMIN.PASSWORD
            validate:
                required: true
            
#        twofa_check:
#            type: conditional
#            condition: config.plugins.admin.twofa_enabled    
#           
#            fields:
#           
#                2fa_code:
#                    type: text
#                    placeholder: PLUGIN_ADMIN.2FA_CODE_INPUT   
---
