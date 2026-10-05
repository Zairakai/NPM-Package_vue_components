# @zairakai/vue-components

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![npm][npm-badge]][npm-link]
[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![License][license-badge]][license]

[![Node.js][node-badge]][node]
[![ESLint][eslint-badge]][eslint]
[![Prettier][prettier-badge]][prettier]

Collection of reusable Vue 3 components — TypeScript, v-model, WAI-ARIA.

**Documentation: <https://vue-components-46b2bb.gitlab.io>**

---

## Install

```bash
npm install @zairakai/vue-components
```

---

## Usage

### Plugin

```typescript
import { createApp } from 'vue'
import VueComponentsPlugin from '@zairakai/vue-components'

const app = createApp(App)
app.use(VueComponentsPlugin)
app.mount('#app')
```

With a custom prefix:

```typescript
app.use(VueComponentsPlugin, { prefix: 'Zk' })
// ZkFormInput, ZkLayoutContainer, etc.
```

### Import by category

```typescript
import { FormInput, FormButton } from '@zairakai/vue-components/Form'
import { LayoutContainer, LayoutRow } from '@zairakai/vue-components/Layout'
import { ContentHeading, ContentParagraph } from '@zairakai/vue-components/Content'
import { MediaImage, MediaVideo } from '@zairakai/vue-components/Medias'
```

---

## Documentation

The [documentation site](https://vue-components-46b2bb.gitlab.io) has a page for every component (description, usage, props, events and slots, generated from the source), the guides and the theming contract. Build it with `cd docs && npm ci && npm run dev`. It is published with GitLab Pages from `main`.

The components ship no style: they give the markup, the WAI-ARIA, the keyboard and the behaviour, and use the web platform first (native `dialog`, Popover API, `details name`, `progress`, `search`, real links) with a script fallback when the browser lacks a feature. See `docs/theming.md` and `docs/browser-support.md`.

---

## Categories

| Category     | Components                                                                                |
| ------------ | ----------------------------------------------------------------------------------------- |
| `Form`       | Inputs, Select, Combobox, MultiSelect, DatePicker, Calendar, Otp, TagsInput, FileDropzone |
| `Layout`     | Container, Grid, Flex, AppBar, BottomNavigation, Splitter, Sticky                         |
| `Content`    | Heading, Paragraph, Link, List, CodeBlock, Terminal, JsonViewer, Diff, Markdown           |
| `Medias`     | Image, LazyImage, Carousel, Lightbox, Player, Audio, Video                                |
| `Display`    | Card, Badge, Avatar, Accordion, Chip, List, Timeline, Rating, Stat                        |
| `Feedback`   | Alert, Toast, Progress, Skeleton, Banner, CookieBanner                                    |
| `Navigation` | Tabs, Pagination, Breadcrumb, Stepper, TreeView, CommandPalette, SkipLink, BackToTop      |
| `Overlay`    | Modal, Dialog, Drawer, Popover, Dropdown, Tooltip, ContextMenu                            |
| `Data`       | DataTable (sort, filters, server mode), VirtualScroll, InfiniteScroll, SortableList       |
| `Utility`    | ThemeSwitcher, ShareButton, Countdown                                                     |

---

## Development

```bash
npm install
make ci              # full CI validation
make test-coverage   # run vitest with coverage
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full development workflow.

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->

[pipeline-main-badge]: https://gitlab.com/zairakai/npm-packages/vue-components/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/npm-packages/vue-components/-/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/npm-packages/vue-components/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/npm-packages/vue-components/-/commits/develop
[coverage-badge]: https://gitlab.com/zairakai/npm-packages/vue-components/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/npm-packages/vue-components/-/pipelines?ref=main
[npm-badge]: https://img.shields.io/npm/v/@zairakai/vue-components
[npm-link]: https://www.npmjs.com/package/@zairakai/vue-components
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/npm-packages/vue-components?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/npm-packages/vue-components/-/releases
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fnpm-packages%2Fvue-components?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/npm-packages/vue-components/-/issues
[node-badge]: https://img.shields.io/badge/node.js-%3E%3D22-green.svg?logo=node.js
[node]: https://nodejs.org
[eslint-badge]: https://img.shields.io/badge/code%20style-eslint-4B32C3.svg?logo=eslint
[eslint]: https://eslint.org
[prettier-badge]: https://img.shields.io/badge/formatter-prettier-F7B93E.svg?logo=prettier
[prettier]: https://prettier.io
[ecosystem]: https://gitlab.com/zairakai
