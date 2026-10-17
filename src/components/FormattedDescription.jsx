/**
 * Renders a product description written in our light text format into real React
 * elements — NO HTML injection (no dangerouslySetInnerHTML). All input is treated
 * as plain text, so any stray markup in the data renders as literal text.
 *
 * Supported markers (one per line):
 *   "## Heading"            -> <h4> section heading
 *   "- item"                -> <li> inside a <ul> (consecutive bullets grouped)
 *   "**Label:** value"      -> labelled line (bold label + value)
 *   blank line              -> paragraph separation
 *   anything else           -> plain paragraph text
 *
 * If the text contains no markers, it falls back to plain paragraphs split on
 * blank lines, so hand-written descriptions still render reasonably.
 */
export default function FormattedDescription({ text, className }) {
  if (!text || !text.trim()) return null

  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let currentParagraph = []
  let currentList = null

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'p', lines: currentParagraph })
      currentParagraph = []
    }
  }
  const flushList = () => {
    if (currentList) {
      blocks.push({ type: 'ul', items: currentList })
      currentList = null
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line === '') {
      flushParagraph()
      flushList()
      continue
    }

    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h', text: line.slice(3).trim() })
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      if (!currentList) currentList = []
      currentList.push(line.slice(2).trim())
      continue
    }

    // Labelled metadata line: **Label:** value
    const labelMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)$/)
    if (labelMatch) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'meta', label: labelMatch[1], value: labelMatch[2] })
      continue
    }

    // Plain text line — accumulate into the current paragraph
    flushList()
    currentParagraph.push(line)
  }
  flushParagraph()
  flushList()

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h':
            return <h4 key={i} className="fd-heading">{block.text}</h4>
          case 'ul':
            return (
              <ul key={i} className="fd-list">
                {block.items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            )
          case 'meta':
            return (
              <p key={i} className="fd-meta">
                <strong>{block.label}:</strong> {block.value}
              </p>
            )
          case 'p':
          default:
            return <p key={i} className="fd-paragraph">{block.lines.join(' ')}</p>
        }
      })}
    </div>
  )
}

/**
 * Strips the light-format markers to produce a clean one-line plain-text preview
 * (for truncated table cells). Treats input as plain text — no HTML.
 */
export function toPlainPreview(text) {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('## '))
    .map((l) => l.replace(/^-\s+/, '').replace(/\*\*(.+?):\*\*/g, '$1:'))
    .join(' ')
}

/**
 * Converts the light-format text into clean, human-readable multi-line text that
 * mirrors what is shown on screen (headings without "##", bullets as "• ",
 * metadata without "**"). Used for the admin "copy description" action.
 * Treats input as plain text — no HTML.
 */
export function toDisplayText(text) {
  if (!text) return ''
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const out = []
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '') {
      // Preserve a single blank line between blocks (avoid consecutive blanks)
      if (out.length > 0 && out[out.length - 1] !== '') out.push('')
      continue
    }
    if (line.startsWith('## ')) {
      out.push(line.slice(3).trim())
    } else if (line.startsWith('- ')) {
      out.push('• ' + line.slice(2).trim())
    } else {
      out.push(line.replace(/\*\*(.+?):\*\*/g, '$1:'))
    }
  }
  // Trim trailing blank line
  while (out.length && out[out.length - 1] === '') out.pop()
  return out.join('\n')
}
