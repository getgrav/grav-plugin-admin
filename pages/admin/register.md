---
form:
  fields:
    - name: username
      type: text
      label: PLUGIN_ADMIN.USERNAME
      placeholder: "lowercase chars only, e.g. 'admin'"
      validate:
        required: true
        message: PLUGIN_LOGIN.USERNAME_NOT_VALID
        pattern: '^[a-z0-9_-]{3,16}$'

    - name: email
      type: email
      label: PLUGIN_ADMIN.EMAIL
      placeholder: "valid email address"
      validate:
        type: email
        message: PLUGIN_ADMIN.EMAIL_VALIDATION_MESSAGE
        required: true

    - name: password1
      type: password
      label: PLUGIN_ADMIN.PASSWORD
      placeholder: "complex string at least 8 chars long"
      validate:
        required: true
        message: PLUGIN_ADMIN.PASSWORD_VALIDATION_MESSAGE
        pattern: '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'

    - name: password2
      type: password
      label: PLUGIN_ADMIN.PASSWORD_CONFIRM
      placeholder: "complex string at least 8 chars long"
      validate:
        required: true
        message: PLUGIN_ADMIN.PASSWORD_VALIDATION_MESSAGE
        pattern: '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'

    - name: fullname
      type: text
      placeholder: "e.g. 'Joe Schmoe'"
      label: PLUGIN_ADMIN.FULL_NAME

    - name: title
      type: text
      placeholder: "e.g. 'Administrator'"
      label: PLUGIN_ADMIN.TITLE

  process:
    register_admin_user: true

---

The Admin plugin has been installed, but no **admin accounts** could be found. Please create an admin account to ensure your Grav install is secure...
