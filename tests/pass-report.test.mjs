import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPassReport, registerPassReportTool } from '../lib/tools/pass-report.js'

test('完整回执：文件、步骤、未改与检查各占一行', () => {
  const { receipt } = buildPassReport({
    skill: 'writing-quarto',
    executed: true,
    mode: 'polish',
    files: [{ path: 'content/ch.qmd', edits: 5 }],
    steps: [
      { name: '5', edits: 3 },
      { name: '6', edits: 1 },
      { name: '7', edits: 1 },
    ],
    held: ['fences', 'facts'],
    checks: [
      { name: 'content', status: 'pass' },
      { name: 'html', status: 'pass' },
    ],
  })
  assert.equal(
    receipt,
    [
      '已执行 writing-quarto · 增量润色',
      'content/ch.qmd',
      '改了 5 处：定句子 3，定用词 1，定版式 1',
      '未改：围栏、事实',
      '检查：内容通过；HTML 可用',
    ].join('\n'),
  )
})

test('没改也出卡：0 处，不写未改与检查行', () => {
  const { receipt } = buildPassReport({
    skill: 'writing-quarto',
    executed: true,
    mode: 'polish',
    files: [{ path: 'index.qmd', edits: 0 }],
  })
  assert.equal(receipt, ['已执行 writing-quarto · 增量润色', 'index.qmd', '改了 0 处'].join('\n'))
})

test('未执行：一行说明技能与原因', () => {
  const { receipt } = buildPassReport({
    skill: 'writing-quarto',
    executed: false,
    mode: 'skipped',
    skip_reason: '当前文件不是章节',
  })
  assert.equal(receipt, '未执行 writing-quarto：当前文件不是章节')
})

test('主题回执：用主题步骤名，跳过的检查不写', () => {
  const { receipt } = buildPassReport({
    skill: 'designing-theme',
    executed: true,
    mode: 'theme',
    files: [{ path: 'theme/css/tokens.css', edits: 2 }],
    steps: [{ name: '定颜色', edits: 2 }],
    checks: [{ name: 'html', status: 'skip' }],
  })
  assert.equal(
    receipt,
    ['已执行 designing-theme · 主题', 'theme/css/tokens.css', '改了 2 处：定颜色 2'].join('\n'),
  )
})

test('拒绝：files 的改动合计与 steps 不一致', () => {
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: true,
        mode: 'polish',
        files: [{ path: 'a.qmd', edits: 3 }],
        steps: [{ name: '5', edits: 2 }],
      }),
    /不一致/,
  )
})

test('拒绝：写作回执里出现主题步骤名', () => {
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: true,
        mode: 'polish',
        files: [{ path: 'a.qmd', edits: 1 }],
        steps: [{ name: '定表面', edits: 1 }],
      }),
    /steps 的 name 只能是：1、2、3、4、5、6、7、8、9/,
  )
})

test('拒绝：主题回执里用数字步骤', () => {
  assert.throws(
    () =>
      buildPassReport({
        skill: 'designing-theme',
        executed: true,
        mode: 'theme',
        files: [{ path: 'a.css', edits: 1 }],
        steps: [{ name: '4', edits: 1 }],
      }),
    /定表面、定字体、定尺度、定颜色、定组件、通过检查/,
  )
})

test('拒绝：未执行缺 skip_reason、模式不匹配、超过 8 个文件', () => {
  assert.throws(
    () => buildPassReport({ skill: 'writing-quarto', executed: false, mode: 'skipped' }),
    /skip_reason/,
  )
  assert.throws(
    () =>
      buildPassReport({
        skill: 'designing-theme',
        executed: true,
        mode: 'polish',
        files: [{ path: 'a.css', edits: 0 }],
      }),
    /designing-theme 只接受 mode: theme/,
  )
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: true,
        mode: 'polish',
        files: Array.from({ length: 9 }, (_, index) => ({ path: `c${index}.qmd`, edits: 0 })),
      }),
    /最多 8 个路径/,
  )
})

test('拒绝：未知字段、重复检查项、超长原因', () => {
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: true,
        mode: 'polish',
        files: [{ path: 'a.qmd', edits: 0 }],
        extra: true,
      }),
    /未知字段：extra/,
  )
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: true,
        mode: 'polish',
        files: [{ path: 'a.qmd', edits: 0 }],
        checks: [
          { name: 'content', status: 'pass' },
          { name: 'content', status: 'fail' },
        ],
      }),
    /checks 的 name 重复/,
  )
  assert.throws(
    () =>
      buildPassReport({
        skill: 'writing-quarto',
        executed: false,
        mode: 'skipped',
        skip_reason: '这'.repeat(41),
      }),
    /skip_reason 最多 40 个字/,
  )
})

test('工具注册：卡片文本就是返回值', async () => {
  const tools = new Map()
  registerPassReportTool({ register: (definition) => tools.set(definition.name, definition) })
  const definition = tools.get('quarto_pass_report')
  assert.ok(definition)
  assert.deepEqual(definition.parameters.properties.skill.enum, ['writing-quarto', 'designing-theme'])

  const args = {
    skill: 'writing-quarto',
    executed: true,
    mode: 'rewrite',
    files: [{ path: 'content/ch.qmd', edits: 1 }],
    steps: [{ name: '2', edits: 1 }],
    checks: [{ name: 'layout', status: 'fail' }],
  }
  const value = await definition.execute(args, {})
  assert.equal(value.receipt, ['已执行 writing-quarto · 全章重构', 'content/ch.qmd', '改了 1 处：定结构 1', '检查：版式未通过'].join('\n'))
  assert.deepEqual(definition.output.render(args, value), [{ type: 'text', text: value.receipt }])
})
