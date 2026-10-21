import assert from 'node:assert/strict'
import test from 'node:test'
import { registerPassReportTool } from '../lib/tools/pass-report.js'
import { registerRenderCheckTool } from '../lib/tools/render-check.js'

const TYPES = new Set(['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'])
const CONSTRAINTS = new Set([
  'type',
  'oneOf',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'enum',
  'const',
])
const ANNOTATIONS = new Set(['description', 'title', 'default', 'examples'])
const ONE_OF_SIBLINGS = ['properties', 'required', 'additionalProperties', 'items', 'enum', 'const']

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 与 DSH 主机的 JSON Schema 子集保持一致：只允许文档列出的关键字，
// oneOf 至少两项且不能与 type/结构关键字同层，type 只能是单个字符串。
function validateSchema(node, path = 'schema', violations = []) {
  if (!isPlainObject(node)) {
    violations.push(`${path} 必须是 schema 对象`)
    return violations
  }
  for (const key of Object.keys(node)) {
    if (CONSTRAINTS.has(key) || ANNOTATIONS.has(key)) continue
    violations.push(`${path}.${key} 不是受支持的关键字`)
  }
  const hasType = Object.hasOwn(node, 'type')
  const hasOneOf = Object.hasOwn(node, 'oneOf')
  if (hasType && hasOneOf) {
    violations.push(`${path} 不能同时声明 type 与 oneOf`)
    return violations
  }
  if (!hasType && !hasOneOf) {
    for (const key of ONE_OF_SIBLINGS) {
      if (Object.hasOwn(node, key)) violations.push(`${path}.${key} 需要 type 或 oneOf`)
    }
    return violations
  }
  if (hasOneOf) {
    if (!Array.isArray(node.oneOf) || node.oneOf.length < 2) {
      violations.push(`${path}.oneOf 至少需要两个 schema`)
    } else {
      for (const key of ONE_OF_SIBLINGS) {
        if (Object.hasOwn(node, key)) violations.push(`${path}.${key} 不能与 oneOf 同层`)
      }
      node.oneOf.forEach((child, index) => validateSchema(child, `${path}.oneOf[${index}]`, violations))
    }
    return violations
  }
  if (typeof node.type !== 'string' || !TYPES.has(node.type)) {
    violations.push(`${path}.type 必须是单个类型字符串`)
    return violations
  }
  if (Object.hasOwn(node, 'properties')) {
    if (!isPlainObject(node.properties)) {
      violations.push(`${path}.properties 必须是对象`)
    } else {
      for (const [name, child] of Object.entries(node.properties)) {
        validateSchema(child, `${path}.properties.${name}`, violations)
      }
    }
  }
  if (Object.hasOwn(node, 'items')) validateSchema(node.items, `${path}.items`, violations)
  if (Object.hasOwn(node, 'required')) {
    if (!Array.isArray(node.required) || node.required.some((name) => typeof name !== 'string')) {
      violations.push(`${path}.required 必须是字符串数组`)
    }
  }
  if (Object.hasOwn(node, 'additionalProperties') && typeof node.additionalProperties !== 'boolean') {
    violations.push(`${path}.additionalProperties 必须是布尔值`)
  }
  return violations
}

function collectDefinitions(register) {
  const definitions = []
  register({ register: (definition) => definitions.push(definition) })
  return definitions
}

test('工具输出 schema 符合 DSH 子集：无 anyOf、type 不为数组', () => {
  const definitions = [
    ...collectDefinitions(registerRenderCheckTool),
    ...collectDefinitions(registerPassReportTool),
  ]
  assert.deepEqual(
    definitions.map((definition) => definition.name),
    ['quarto_render_check', 'quarto_pass_report'],
  )
  for (const definition of definitions) {
    const violations = validateSchema(definition.output.schema)
    assert.deepEqual(violations, [], `${definition.name} 输出 schema 不符合主机子集`)
    assert.equal(
      JSON.stringify(definition.output.schema).includes('"anyOf"'),
      false,
      `${definition.name} 输出 schema 仍含 anyOf`,
    )
  }
})
