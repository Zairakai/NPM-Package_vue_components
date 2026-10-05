# Theming

`@zairakai/vue-components` ships **no style**. The components give the semantic
markup, the accessibility (WAI-ARIA, keyboard) and the behaviour; the look is
yours, usually written with [`@zairakai/mithril-scss`][mithril]. This document
is the contract between the markup and your styles.

## Class hooks

Every component has a stable class on its root element and on its main parts.
Add your own with the `class` prop, it is kept.

| Component | Classes |
| :--- | :--- |
| `DisplayCard` | `card`, `card-header`, `card-body`, `card-footer` |
| `DisplayBadge` | `badge` |
| `DisplayAvatar` | `avatar` |
| `DisplayAccordion` | `accordion`, `accordion-item`, `accordion-header`, `accordion-trigger`, `accordion-panel` |
| `DisplayDivider` | `divider` |
| `FeedbackAlert` | `alert`, `alert-close` |
| `FeedbackToastContainer` | `toast-container`, `toast`, `toast-close` |
| `FeedbackProgress` | `progress`, `progress-bar` |
| `FeedbackSkeleton` | `skeleton` |
| `NavigationTabs` | `tabs`, `tab-list`, `tab`, `tab-panel` |
| `NavigationPagination` | `pagination`, `pagination-item`, `pagination-gap` |
| `NavigationBreadcrumb` | `breadcrumb`, `breadcrumb-item` |
| `NavigationStepper` | `stepper`, `step` |
| `OverlayModal`, `OverlayDialog`, `OverlayDrawer` | `modal`, `dialog`, `drawer`, `modal-header`, `modal-body`, `modal-footer` |
| `OverlayTooltip`, `OverlayPopover`, `OverlayDropdown` | `tooltip`, `popover`, `dropdown`, `dropdown-menu`, `dropdown-item` |
| `DataTable` | `data-table`, `data-table-sort`, `data-table-empty`, `data-table-loading` |
| `FormCombobox`, `FormMultiSelect` | `combobox`, `combobox-list`, `combobox-option`, `multi-select-chip` |
| `FormDatePicker` | `date-picker`, `date-picker-day` |

## State attributes

State is exposed with `data-*` attributes and ARIA attributes, never with a
class that you would have to guess. Style them directly:

```scss
.accordion-trigger[aria-expanded="true"] { /* open */ }
.badge[data-variant="success"] { /* variants */ }
.tab[aria-selected="true"] { /* active tab */ }
.alert[data-variant="error"] { /* ... */ }
.modal[open] { /* open dialog */ }
.dropdown-item[data-active] { /* keyboard highlight */ }
```

Variants (`info`, `success`, `warning`, `error`, and `default`) are always in
`data-variant`; sizes in `data-size` (`small`, `medium`, `large`); the
placement of a floating element in `data-placement` (`top`, `bottom-start`...).

## Functional CSS only

The only inline styles are the ones the behaviour needs, and they can be
overridden with custom properties:

| Custom property | Used by | Default |
| :--- | :--- | :--- |
| `--zk-z-overlay` | modal, dialog, drawer | `1000` |
| `--zk-z-floating` | tooltip, popover, dropdown, combobox | `1100` |
| `--zk-z-toast` | toast container | `1200` |
| `--zk-drawer-size` | drawer | `24rem` |

## Dark mode and tokens

Colors, spacings and typography are the tokens of `@zairakai/mithril-scss`
(CSS custom properties). A dark theme is a second set of values for those
properties: the components do not need to know about it.

[mithril]: https://www.npmjs.com/package/@zairakai/mithril-scss
