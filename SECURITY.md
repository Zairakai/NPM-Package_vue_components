# Security Policy

> This project follows the [Zairakai Global Security Policy][handbook-security].  
> Please refer to it for standard protections, response timeline, and contact information.

---

## 🔒 Reporting Vulnerabilities

| Channel | Description | Contact / Link |
| :--- | :--- | :--- |
| **GitLab Issues** | For non-sensitive issues (bugs, public vulnerabilities). | [Open Issue][issues] |
| **Email** | Alternative secure contact. | `security@the-white-rabbits.fr` |

Please **do not disclose vulnerabilities publicly** until they have been reviewed.

---

## 🛡️ Security Features

### Protection Layers

| Layer | Security Protection |
| :--- | :--- |
| **Static Analysis** | ESLint with Vue plugin and strict ruleset. |
| **CI Pipeline** | Automated secret detection in GitLab CI. |

---

## 🔍 Security Scope

`@zairakai/vue-components` provides reusable Vue 3 UI components (Form, Layout, Content, Medias):

- no external network calls
- no dynamic code execution (`eval`, `Function()`)
- component output safety depends on template usage and `v-html` escaping in consuming apps

You remain responsible for sanitizing dynamic content passed to components, particularly for slots and `v-html` usage.

---

[handbook-security]: https://gitlab.com/zairakai/handbook/-/blob/main/SECURITY.md
[issues]: https://gitlab.com/zairakai/npm-packages/vue-components/-/issues
