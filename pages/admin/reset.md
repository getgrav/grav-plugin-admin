---
title: Reset password
expires: 0
access:
  admin.login: false


forms:
  admin-login-reset:
    type: admin
    method: post

    fields:
      username:
        type: text
        placeholder: PLUGIN_ADMIN.USERNAME
        readonly: true
      password:
        type: password
        placeholder: PLUGIN_ADMIN.PASSWORD
        autofocus: true
      token:
        type: hidden
---
