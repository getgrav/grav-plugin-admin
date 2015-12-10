---
form:
  fields:
    - name: spacer
      title: Required
      type: spacer
  
    - name: username
      type: text
      placeholder: "Choose a username"
      validate:
        required: true
    
    - name: email
      type: text
      placeholder: "Enter your email"
      validate:
        required: true
        
    - name: password1
      type: password
      placeholder: Enter password
      validate:
        required: true

    - name: password2
      type: password
      placeholder: Confirm password
      validate:
        required: true
        
    - name: spacer
      title: Optional
      type: spacer
        
    - name: fullname
      type: text
      placeholder: "Enter your full name"    
    
    - name: title
      type: text
      placeholder: "Enter a title"    


  buttons:
      - type: submit
        value: Submit
      - type: reset
        value: Reset

  process:
        register_user:
            fields:
                access: ['site.login']
                state: 'enabled'
            options:
                validate_password1_and_password2: true
                login_after_registration: true

        message: "You are logged in"
---

# Register
