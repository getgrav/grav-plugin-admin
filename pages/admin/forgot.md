---
title: Forgot password
expires: 0
access:
  admin.login: false

forms:
  admin-login-forgot:
    type: admin
    method: post

    fields:
      username:
        type: text
        placeholder: PLUGIN_ADMIN.USERNAME
        autofocus: true
        validate:
          required: true
---
