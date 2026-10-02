# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version  | Supported          |
| -------  | ------------------ |
| 1.7.48   | :white_check_mark: |
| 1.7.47   | :white_check_mark: |
| 1.7.46   | :white_check_mark: |

## Reporting a Vulnerability

### Summary
Cross Site Scripting vulnerability in grav v.1.7.48, v.1.7.47 and v.1.7.46 allows an attacker to execute arbitrary code via the onerror attribute of the img element

### Details
![image](https://github.com/user-attachments/assets/af6b5a25-e2ff-4bc9-abe9-71008616e953)
**It is impossible to save when using common script tags**
**However, script execution is possible when using onerror attribute of an img element.**

![image](https://github.com/user-attachments/assets/6ed61a16-580a-4f2e-a823-21d88c73f739)
**It doesn't even come up with a warning**

![image](https://github.com/user-attachments/assets/8959c8ac-06ad-47d7-9992-cec9671a16cc)

### PoC
```<img src=x onerror=alert('tyojong')>```

### Impact
Cross Site Scripting (XSS)
It can lead to additional attacks such as CSRF.

## CVE
CVE-2025-46198
