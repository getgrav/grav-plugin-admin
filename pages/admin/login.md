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
---
