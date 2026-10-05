const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** A link target that is safe to put in href: http, https, mailto, relative or an anchor. */
export function safeUrl(url: string): string | undefined {
  const trimmed = url.trim()

  return /^(https?:|mailto:|\/|#|\.\.?\/|[^:]*$)/i.test(trimmed) ? trimmed : undefined
}

/** The inline marks: code, bold, italic, links. Everything is escaped first. */
function inline(text: string): string {
  const codes: string[] = []
  let out = escapeHtml(text).replace(
    /`([^`]+)`/g,
    (_match, code: string) => `\u0000${codes.push(`<code>${code}</code>`) - 1}\u0000`
  )

  out = out
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_match, label: string, url: string) => {
      const safe = safeUrl(url.replace(/&amp;/g, '&'))

      return safe ? `<a href="${escapeHtml(safe)}" rel="noopener noreferrer">${label}</a>` : label
    })

  // eslint-disable-next-line no-control-regex
  return out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codes[Number(index)])
}

/**
 * A small renderer for the usual Markdown: headings, paragraphs, bold, italic,
 * inline code, fenced code, links, lists, quotes and rules. The text is escaped
 * and only these tags come out, so it is safe to show as HTML. For anything more,
 * give the component a renderer of your own (markdown-it, marked) with a sanitizer.
 */
export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const html: string[] = []
  let index = 0

  const startsBlock = (line: string): boolean => /^(#{1,6}\s|```|>\s?|[-*+]\s|\d+\.\s|(-{3,}|\*{3,})\s*$)/.test(line)

  while (index < lines.length) {
    const line = lines[index]

    if ('' === line.trim()) {
      index += 1
    } else if (line.startsWith('```')) {
      const language = line
        .slice(3)
        .trim()
        .replace(/[^\w-]/g, '')
      const code: string[] = []

      index += 1

      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index])
        index += 1
      }

      index += 1
      html.push(
        `<pre><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`
      )
    } else if (/^#{1,6}\s/.test(line)) {
      const level = line.indexOf(' ')

      html.push(`<h${level}>${inline(line.slice(level + 1).trim())}</h${level}>`)
      index += 1
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      html.push('<hr>')
      index += 1
    } else if (/^>\s?/.test(line)) {
      const quote: string[] = []

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }

      html.push(`<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`)
    } else if (/^([-*+]|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line)
      const items: string[] = []

      while (index < lines.length && /^([-*+]|\d+\.)\s/.test(lines[index]) && ordered === /^\d+\./.test(lines[index])) {
        items.push(`<li>${inline(lines[index].replace(/^([-*+]|\d+\.)\s/, ''))}</li>`)
        index += 1
      }

      html.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
    } else {
      const paragraph: string[] = []

      while (
        index < lines.length &&
        '' !== lines[index].trim() &&
        (0 === paragraph.length || !startsBlock(lines[index]))
      ) {
        paragraph.push(lines[index])
        index += 1
      }

      html.push(`<p>${inline(paragraph.join(' '))}</p>`)
    }
  }

  return html.join('\n')
}
