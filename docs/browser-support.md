# Browser support

The components use the platform first: the native element or API when the
browser has it, a script fallback when it does not. The detection is done once
(`getSupport()`), feature by feature, never by browser name.

| Feature | Used by | Native when available | Fallback |
| :--- | :--- | :--- | :--- |
| `<dialog>` and `showModal()` | Modal, Dialog, Drawer | focus trap, Escape, inert page, top layer, `::backdrop` | a `role="dialog"` with its own focus trap, Escape, backdrop and scroll lock |
| `closedby` on `<dialog>` | Modal, Dialog, Drawer | light dismiss without code | a click handler on the backdrop |
| Popover API | Tooltip, Popover, Dropdown, Combobox, DatePicker, toasts | top layer, light dismiss, Escape, focus return | `hidden` toggle with outside click and Escape handlers |
| `<details name>` | Accordion | exclusive group without code | the accordion closes the others itself |
| `hidden="until-found"` | Tabs panels | the page search reveals a hidden panel | the panel stays hidden until selected |
| `<search>` | DataTable filters | landmark without a role | a `div` with `role="search"` |
| `<progress>`, `<meter>` | Progress, Rating | built-in role and value | always available |
| Invoker commands | Modal, Drawer, Dropdown triggers | `commandfor` and `command` on a button | a click handler |
| CSS anchor positioning | floating elements | detected, see below | position computed in script (placement, flip, shift) |
| View Transitions | Carousel, Tabs | animated change of panel | no animation |
| Clipboard API | CodeBlock, Terminal copy buttons | `navigator.clipboard.writeText` | `document.execCommand('copy')` on a hidden textarea |
| `input.showPicker()` | DatePicker, TimePicker, ColorPicker | open the native picker | the custom panel |
| `Intl` | dates, numbers, plurals, lists | always used | none needed |

## Forcing a fallback

For tests, for an old browser you support, or to avoid a bug:

```ts
app.use(VueComponentsPlugin, { support: { popover: false, dialog: false } })
```

`detectSupport(env)` is a pure function of the environment, so every
combination can be tested without a browser.
