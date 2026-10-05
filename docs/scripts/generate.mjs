// Generates the API pages of every component from the source, so that they cannot drift from the code.
// Run: npm run generate (from docs/). The pages are written in docs/components/ and are not committed.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'vue-docgen-api'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const out = resolve(here, '../components')
const descriptions = JSON.parse(readFileSync(join(here, 'descriptions.json'), 'utf8'))

const categories = {
  Content: 'Text content, typography and code.',
  Data: 'Tables, lists and data loading.',
  Display: 'Cards, badges, accordions and other ways to show content.',
  Feedback: 'Alerts, toasts, progress and banners.',
  Form: 'Inputs, rich inputs and form helpers.',
  Layout: 'Page structure and application shell.',
  Medias: 'Images, video, audio and galleries.',
  Navigation: 'Tabs, pagination, trees, palettes and links.',
  Overlay: 'Dialogs, drawers, popovers, menus and tooltips.',
  Utility: 'Small helpers: theme, share, countdown.',
}

// In a code span only the pipe has to be escaped.
const code = (text) =>
  String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
// In plain text Markdown would read < and { as HTML or as a Vue expression.
const escapeCell = (text) =>
  String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')

// The `//` comment lines written above each prop are its description.
function propComments(source) {
  const start = source.indexOf('defineProps({')
  const comments = {}

  if (-1 === start) {
    return comments
  }

  let pending = []

  for (const line of source.slice(start).split('\n').slice(1)) {
    const comment = /^ {4}\/\/\s?(.*)$/.exec(line)
    const prop = /^ {4}(\w+)\s*[:,]/.exec(line)

    if (comment) {
      pending.push(comment[1])
    } else if (prop) {
      comments[prop[1]] = pending.join(' ')
      pending = []
    } else if (/^ {2}\}\)/.test(line)) {
      break
    } else {
      pending = []
    }
  }

  return comments
}

function exportsOf(category) {
  const index = readFileSync(join(root, 'src', category, 'index.ts'), 'utf8')

  return [...index.matchAll(/export \{ default as (\w+) \} from '\.\/([\w-]+\.vue)'/g)].map((match) => ({
    name: match[1],
    file: join(root, 'src', category, match[2]),
  }))
}

function usage(name, props) {
  const required = (props ?? []).filter((prop) => prop.required)
  const attributes = required
    .map((prop) => ('string' === prop.type?.name ? `${prop.name}="…"` : `:${prop.name}="…"`))
    .join(' ')

  return `<${name}${attributes ? ` ${attributes}` : ''} />`
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const sidebar = []
let total = 0

for (const [category, summary] of Object.entries(categories)) {
  const dir = join(out, category.toLowerCase())

  mkdirSync(dir, { recursive: true })

  const items = []

  for (const { name, file } of exportsOf(category).sort((a, b) => a.name.localeCompare(b.name))) {
    const doc = await parse(file)
    const comments = propComments(readFileSync(file, 'utf8'))
    const lines = [`# ${name}`, '', descriptions[name] ?? `A component of the ${category} category.`, '']

    lines.push('```ts', `import { ${name} } from '@zairakai/vue-components/${category}'`, '```', '')
    lines.push('## Usage', '', '```vue', usage(name, doc.props), '```', '')

    if (doc.props?.length) {
      lines.push('## Props', '', '| Name | Type | Default | Description |', '| :--- | :--- | :--- | :--- |')

      for (const prop of doc.props) {
        const def = prop.defaultValue ? `\`${code(prop.defaultValue.value)}\`` : prop.required ? 'required' : ''

        lines.push(
          `| \`${prop.name}\` | \`${code(prop.type?.name ?? '')}\` | ${def} | ${escapeCell(prop.description || comments[prop.name])} |`
        )
      }

      lines.push('')
    }

    if (doc.events?.length) {
      lines.push('## Events', '', '| Name | Description |', '| :--- | :--- |')
      doc.events.forEach((event) => lines.push(`| \`${event.name}\` | ${escapeCell(event.description)} |`))
      lines.push('')
    }

    if (doc.slots?.length) {
      lines.push('## Slots', '', '| Name | Description |', '| :--- | :--- |')
      doc.slots.forEach((slot) => lines.push(`| \`${code(slot.name)}\` | ${escapeCell(slot.description)} |`))
      lines.push('')
    }

    lines.push('See [Theming](/theming) for the class hooks and the `data-*` state of the components.', '')
    writeFileSync(join(dir, `${name}.md`), lines.join('\n'))
    items.push({ text: name, link: `/components/${category.toLowerCase()}/${name}` })
    total += 1
  }

  writeFileSync(
    join(dir, 'index.md'),
    [
      `# ${category}`,
      '',
      summary,
      '',
      ...items.map((item) =>
        `- [${item.text}](${item.link}) ${descriptions[item.text]?.split('. ')[0] ?? ''}`.trimEnd()
      ),
      '',
    ].join('\n')
  )
  sidebar.push({ text: category, collapsed: true, link: `/components/${category.toLowerCase()}/`, items })
}

writeFileSync(
  join(out, 'index.md'),
  [
    '# Components',
    '',
    `${total} components in ${sidebar.length} categories.`,
    '',
    ...sidebar.map((group) => `- [${group.text}](${group.link}): ${categories[group.text]}`),
    '',
  ].join('\n')
)
writeFileSync(resolve(here, '../.vitepress/sidebar.generated.json'), JSON.stringify(sidebar, null, 2))
console.log(`${total} component pages written`)
