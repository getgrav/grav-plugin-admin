---
form:
  fields:
    - name: spacer
      title: Required
      type: spacer

    - name: username
      type: text
      placeholder: PLUGIN_ADMIN.USERNAME
      validate:
        required: true
        message: PLUGIN_LOGIN.USERNAME_NOT_VALID
        pattern: '^[a-z0-9_-]{3,16}$'

    - name: email
      type: text
      placeholder: PLUGIN_ADMIN.EMAIL
      validate:
        type: email
        message: PLUGIN_ADMIN.EMAIL_VALIDATION_MESSAGE
        required: true

    - name: password1
      type: password
      placeholder: PLUGIN_ADMIN.PASSWORD
      validate:
        required: true
        message: PLUGIN_ADMIN.PASSWORD_VALIDATION_MESSAGE
        pattern: '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'

    - name: password2
      type: password
      placeholder: PLUGIN_ADMIN.PASSWORD_CONFIRM
      validate:
        required: true
        message: PLUGIN_ADMIN.PASSWORD_VALIDATION_MESSAGE
        pattern: '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'

    - name: spacer
      title: Optional
      type: spacer

    - name: fullname
      type: text
      placeholder: PLUGIN_ADMIN.FULL_NAME

    - name: title
      type: text
      placeholder: PLUGIN_ADMIN.TITLE

  process:
    register_admin_user: true

---

# Register
