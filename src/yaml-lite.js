// A small, dependency-free YAML subset parser.
//
// The audit tool only needs the book structure of `_quarto.yml`: nested maps,
// block sequences, quoted/plain scalars, inline sequences and block scalars.
// Anything outside that subset is reported as a parse error instead of being
// guessed. `js-yaml` is used when it happens to be installed (see audit.js).

export class YamlLiteError extends Error {
  constructor(message, line) {
    super(line === undefined ? message : `${message} (line ${line})`)
    this.name = 'YamlLiteError'
    this.line = line
  }
}

function tokenize(text) {
  const tokens = []
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (/^\s*$/.test(raw)) continue
    const withoutComment = stripComment(raw)
    if (/^\s*$/.test(withoutComment)) continue
    if (/^\s*---\s*$/.test(withoutComment) || /^\s*\.\.\.\s*$/.test(withoutComment)) continue
    const indent = withoutComment.length - withoutComment.trimStart().length
    tokens.push({ indent, text: withoutComment.trim(), line: i + 1 })
  }
  return tokens
}

function stripComment(line) {
  let quote = null
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quote !== null) {
      if (ch === '\\' && quote === '"') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).trimEnd()
  }
  return line.trimEnd()
}

function isDash(text) {
  return text === '-' || text.startsWith('- ')
}

function splitKey(text, line) {
  let quote = null
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote !== null) {
      if (ch === '\\' && quote === '"') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '[' || ch === '{') depth++
    else if (ch === ']' || ch === '}') depth--
    else if (ch === ':' && depth === 0) {
      if (i + 1 === text.length || /\s/.test(text[i + 1])) {
        return [text.slice(0, i).trim(), text.slice(i + 1).trim()]
      }
    }
  }
  throw new YamlLiteError(`expected a "key: value" pair but found "${text}"`, line)
}

function parseScalar(raw, line) {
  let text = raw.trim()
  const tag = /^!![^\s]+\s*/.exec(text)
  if (tag !== null) text = text.slice(tag[0].length).trim()
  if (text === '' || text === '~' || text === 'null' || text === 'Null' || text === 'NULL') return null
  if (text === 'true' || text === 'True' || text === 'TRUE') return true
  if (text === 'false' || text === 'False' || text === 'FALSE') return false
  if (text.startsWith('"') && text.endsWith('"')) {
    try {
      return JSON.parse(text)
    } catch {
      throw new YamlLiteError(`invalid double-quoted string ${text}`, line)
    }
  }
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replace(/''/g, "'")
  if (text.startsWith('"') || text.startsWith("'")) {
    throw new YamlLiteError(`unterminated quoted string ${text}`, line)
  }
  if (text.startsWith('[') && text.endsWith(']')) {
    const body = text.slice(1, -1).trim()
    if (body === '') return []
    return splitFlow(body).map((part) => parseScalar(part, line))
  }
  if (text.startsWith('{') && text.endsWith('}')) {
    const body = text.slice(1, -1).trim()
    const object = {}
    if (body === '') return object
    for (const part of splitFlow(body)) {
      const [key, value] = splitKey(part, line)
      object[unquoteKey(key)] = parseScalar(value, line)
    }
    return object
  }
  if (/^[-+]?\d+$/.test(text)) return Number.parseInt(text, 10)
  if (/^[-+]?(?:\d+\.\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(text)) return Number.parseFloat(text)
  return text
}

function splitFlow(body) {
  const parts = []
  let start = 0
  let quote = null
  let depth = 0
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (quote !== null) {
      if (ch === '\\' && quote === '"') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '[' || ch === '{') depth++
    else if (ch === ']' || ch === '}') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(body.slice(start, i))
      start = i + 1
    }
  }
  parts.push(body.slice(start))
  return parts.map((part) => part.trim()).filter((part) => part !== '')
}

function unquoteKey(key) {
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    return key.slice(1, -1)
  }
  return key
}

function isBlockScalar(rest) {
  return /^[|>][+-]?\d*$/.test(rest.replace(/^!![^\s]+\s*/, '').trim())
}

function parseBlockScalar(tokens, index, indent, style) {
  const collected = []
  let i = index
  while (i < tokens.length && tokens[i].indent > indent) {
    collected.push(tokens[i])
    i++
  }
  if (collected.length === 0) return ['', i]
  const minIndent = Math.min(...collected.map((token) => token.indent))
  const lines = collected.map((token) => ' '.repeat(token.indent - minIndent) + token.text)
  const value = style.startsWith('>') ? lines.join(' ') : lines.join('\n')
  return [value, i]
}

function parseNode(tokens, index, indent) {
  if (index >= tokens.length) return [null, index]
  const token = tokens[index]
  if (token.indent !== indent) {
    throw new YamlLiteError(`unexpected indentation at "${token.text}"`, token.line)
  }
  return isDash(token.text) ? parseSequence(tokens, index, indent) : parseMapping(tokens, index, indent)
}

function parseSequence(tokens, index, indent) {
  const result = []
  let i = index
  while (i < tokens.length && tokens[i].indent === indent && isDash(tokens[i].text)) {
    const token = tokens[i]
    const rest = token.text.slice(1).trim()
    i++
    if (rest === '') {
      if (i < tokens.length && tokens[i].indent > indent) {
        const nested = parseNode(tokens, i, tokens[i].indent)
        result.push(nested[0])
        i = nested[1]
      } else {
        result.push(null)
      }
      continue
    }
    if (isDash(rest)) throw new YamlLiteError('nested inline sequences are not supported', token.line)
    if (looksLikePair(rest)) {
      const item = {}
      const [key, value] = splitKey(rest, token.line)
      let itemValue
      if (value === '') {
        if (i < tokens.length && tokens[i].indent > indent) {
          const nested = parseNode(tokens, i, tokens[i].indent)
          itemValue = nested[0]
          i = nested[1]
        } else {
          itemValue = null
        }
      } else if (isBlockScalar(value)) {
        const nested = parseBlockScalar(tokens, i, indent, value)
        itemValue = nested[0]
        i = nested[1]
      } else {
        itemValue = parseScalar(value, token.line)
      }
      item[unquoteKey(key)] = itemValue
      if (i < tokens.length && tokens[i].indent > indent) {
        const continuation = parseMapping(tokens, i, tokens[i].indent)
        Object.assign(item, continuation[0])
        i = continuation[1]
      }
      result.push(item)
      continue
    }
    result.push(parseScalar(rest, token.line))
  }
  return [result, i]
}

function looksLikePair(text) {
  try {
    splitKey(text, 0)
    return true
  } catch {
    return false
  }
}

function parseMapping(tokens, index, indent) {
  const result = {}
  let i = index
  while (i < tokens.length && tokens[i].indent === indent && !isDash(tokens[i].text)) {
    const token = tokens[i]
    const [key, value] = splitKey(token.text, token.line)
    i++
    if (value === '') {
      if (i < tokens.length && tokens[i].indent > indent) {
        const nested = parseNode(tokens, i, tokens[i].indent)
        result[unquoteKey(key)] = nested[0]
        i = nested[1]
      } else {
        result[unquoteKey(key)] = null
      }
      continue
    }
    if (isBlockScalar(value)) {
      const nested = parseBlockScalar(tokens, i, indent, value)
      result[unquoteKey(key)] = nested[0]
      i = nested[1]
      continue
    }
    result[unquoteKey(key)] = parseScalar(value, token.line)
  }
  if (i < tokens.length && tokens[i].indent === indent && isDash(tokens[i].text)) {
    throw new YamlLiteError('cannot mix mappings and sequences at one indentation level', tokens[i].line)
  }
  return [result, i]
}

/**
 * Parse a YAML subset. Throws `YamlLiteError` with a line number on anything
 * outside the supported subset.
 * @param {string} text
 * @returns {unknown}
 */
export function parseYamlLite(text) {
  const tokens = tokenize(text)
  if (tokens.length === 0) return null
  const [value, next] = parseNode(tokens, 0, tokens[0].indent)
  if (next !== tokens.length) {
    throw new YamlLiteError(`unexpected content at "${tokens[next].text}"`, tokens[next].line)
  }
  return value
}
