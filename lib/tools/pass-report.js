// `quarto_pass_report`：把一次写作或主题润色的结果压成固定行数的卡片。
//
// 入参是闭集：模式、文件、步骤、未改项、检查状态都只能取登记过的值。
// 卡片由工具自己拼接，返回的文本就是卡片本身，不附章节原文，也不贴改写后的句子。
// 没改也要出卡，这样「插件没跑」和「跑了但没改」在会话里分得开。
export const PASS_SKILLS = ['writing-quarto', 'designing-theme'];
export const PASS_MODES = ['polish', 'rewrite', 'theme', 'skipped'];
export const HELD_ITEMS = ['fences', 'facts', 'css', 'prose'];
export const CHECK_NAMES = ['content', 'html', 'layout'];
export const CHECK_STATUSES = ['pass', 'fail', 'skip'];
export const MAX_FILES = 8;
export const MAX_SKIP_REASON = 40;
/** 写作九步的短名，与 `skills/writing-quarto/SKILL.md` 的「九步」逐字对应。 */
export const WRITING_STEPS = {
    '1': '定任务',
    '2': '定结构',
    '3': '排列内容块',
    '4': '定段落',
    '5': '定句子',
    '6': '定用词',
    '7': '定版式',
    '8': '回读并退回',
    '9': '检查与渲染',
};
/** 主题步骤表的名字，与 `skills/designing-theme/references/theme-spine.md` 逐字对应。 */
export const THEME_STEPS = ['定表面', '定字体', '定尺度', '定颜色', '定组件', '通过检查'];
const MODE_LABELS = {
    polish: '增量润色',
    rewrite: '全章重构',
    theme: '主题',
    skipped: '未执行',
};
const HELD_LABELS = {
    fences: '围栏',
    facts: '事实',
    css: '样式',
    prose: '正文',
};
const CHECK_LABELS = {
    content: '内容',
    html: 'HTML',
    layout: '版式',
};
const PASS_VERDICTS = {
    content: '通过',
    html: '可用',
    layout: '通过',
};
const FAIL_VERDICTS = {
    content: '未通过',
    html: '不可用',
    layout: '未通过',
};
const TOP_LEVEL_KEYS = ['skill', 'executed', 'mode', 'files', 'steps', 'held', 'checks', 'skip_reason'];
function fail(message) {
    throw new Error(message);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isPlainCount(value) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
function allowedSteps(skill) {
    return skill === 'writing-quarto' ? Object.keys(WRITING_STEPS) : [...THEME_STEPS];
}
function stepLabel(skill, name) {
    return skill === 'writing-quarto' ? (WRITING_STEPS[name] ?? name) : name;
}
function normalizeFiles(value) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        fail('files 必须是数组');
    if (value.length > MAX_FILES)
        fail(`files 最多 ${MAX_FILES} 个路径`);
    return value.map((item) => {
        if (!isRecord(item))
            fail('files 的每一项必须是 { path, edits }');
        const keys = Object.keys(item);
        if (keys.some((key) => key !== 'path' && key !== 'edits'))
            fail('files 的每一项只允许 path 和 edits');
        const filePath = item.path;
        if (typeof filePath !== 'string' || filePath.trim() === '')
            fail('files 的 path 必须是非空字符串');
        if (!isPlainCount(item.edits))
            fail('files 的 edits 必须是非负整数');
        return { path: filePath.trim(), edits: item.edits };
    });
}
function normalizeSteps(value, skill) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        fail('steps 必须是数组');
    const allowed = allowedSteps(skill);
    const seen = new Set();
    return value.map((item) => {
        if (!isRecord(item))
            fail('steps 的每一项必须是 { name, edits }');
        const keys = Object.keys(item);
        if (keys.some((key) => key !== 'name' && key !== 'edits'))
            fail('steps 的每一项只允许 name 和 edits');
        const name = item.name;
        if (typeof name !== 'string' || !allowed.includes(name)) {
            fail(`steps 的 name 只能是：${allowed.join('、')}`);
        }
        if (seen.has(name))
            fail(`steps 的 name 重复：${name}`);
        seen.add(name);
        if (typeof item.edits !== 'number' || !Number.isInteger(item.edits) || item.edits < 1) {
            fail('steps 的 edits 必须是正整数');
        }
        return { name, edits: item.edits };
    });
}
function normalizeHeld(value) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        fail('held 必须是数组');
    const seen = new Set();
    return value.map((item) => {
        if (typeof item !== 'string' || !HELD_ITEMS.includes(item)) {
            fail(`held 只能是：${HELD_ITEMS.join('、')}`);
        }
        if (seen.has(item))
            fail(`held 重复：${item}`);
        seen.add(item);
        return item;
    });
}
function normalizeChecks(value) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        fail('checks 必须是数组');
    const seen = new Set();
    return value.map((item) => {
        if (!isRecord(item))
            fail('checks 的每一项必须是 { name, status }');
        const keys = Object.keys(item);
        if (keys.some((key) => key !== 'name' && key !== 'status'))
            fail('checks 的每一项只允许 name 和 status');
        const name = item.name;
        if (typeof name !== 'string' || !CHECK_NAMES.includes(name)) {
            fail(`checks 的 name 只能是：${CHECK_NAMES.join('、')}`);
        }
        if (seen.has(name))
            fail(`checks 的 name 重复：${name}`);
        seen.add(name);
        const status = item.status;
        if (typeof status !== 'string' || !CHECK_STATUSES.includes(status)) {
            fail(`checks 的 status 只能是：${CHECK_STATUSES.join('、')}`);
        }
        return { name: name, status: status };
    });
}
function checkLine(checks) {
    const ordered = CHECK_NAMES.map((name) => checks.find((check) => check.name === name)).filter((check) => check !== undefined && check.status !== 'skip');
    if (ordered.length === 0)
        return undefined;
    return '检查：' + ordered.map((check) => {
        const label = CHECK_LABELS[check.name];
        const verdict = check.status === 'pass' ? PASS_VERDICTS[check.name] : FAIL_VERDICTS[check.name];
        // 中文标签直接接结论，英文标签（HTML）前面留一个空格。
        return `${label}${/[A-Za-z]$/.test(label) ? ' ' : ''}${verdict}`;
    }).join('；');
}
/** 校验入参并生成卡片；入参不合格时抛错，不猜测默认值。 */
export function buildPassReport(input) {
    if (!isRecord(input))
        fail('回执入参必须是对象');
    const unknownKey = Object.keys(input).find((key) => !TOP_LEVEL_KEYS.includes(key));
    if (unknownKey)
        fail(`未知字段：${unknownKey}`);
    const skill = input.skill;
    if (typeof skill !== 'string' || !PASS_SKILLS.includes(skill)) {
        fail(`skill 只能是：${PASS_SKILLS.join('、')}`);
    }
    const typedSkill = skill;
    if (typeof input.executed !== 'boolean')
        fail('executed 必须是布尔值');
    const mode = input.mode;
    if (typeof mode !== 'string' || !PASS_MODES.includes(mode)) {
        fail(`mode 只能是：${PASS_MODES.join('、')}`);
    }
    const typedMode = mode;
    if (!input.executed) {
        if (typedMode !== 'skipped')
            fail('executed 为 false 时 mode 必须是 skipped');
        const reason = input.skip_reason;
        if (typeof reason !== 'string' || reason.trim() === '')
            fail('未执行时必须给出 skip_reason');
        if ([...reason.trim()].length > MAX_SKIP_REASON)
            fail(`skip_reason 最多 ${MAX_SKIP_REASON} 个字`);
        if (input.files !== undefined && Array.isArray(input.files) && input.files.length > 0) {
            fail('未执行时 files 必须为空');
        }
        if (input.steps !== undefined && Array.isArray(input.steps) && input.steps.length > 0) {
            fail('未执行时 steps 必须为空');
        }
        if (input.held !== undefined && Array.isArray(input.held) && input.held.length > 0) {
            fail('未执行时 held 必须为空');
        }
        if (input.checks !== undefined && Array.isArray(input.checks) && input.checks.length > 0) {
            fail('未执行时 checks 必须为空');
        }
        return { receipt: `未执行 ${typedSkill}：${reason.trim()}` };
    }
    if (typedMode === 'skipped')
        fail('executed 为 true 时 mode 不能是 skipped');
    if (typedSkill === 'designing-theme' && typedMode !== 'theme')
        fail('designing-theme 只接受 mode: theme');
    if (typedSkill === 'writing-quarto' && typedMode === 'theme')
        fail('writing-quarto 不接受 mode: theme');
    const files = normalizeFiles(input.files);
    if (files.length === 0)
        fail('已执行时 files 至少给 1 个路径');
    const steps = normalizeSteps(input.steps, typedSkill);
    const held = normalizeHeld(input.held);
    const checks = normalizeChecks(input.checks);
    const fileEdits = files.reduce((sum, file) => sum + file.edits, 0);
    const stepEdits = steps.reduce((sum, step) => sum + step.edits, 0);
    if (fileEdits !== stepEdits)
        fail(`files 的改动合计 ${fileEdits} 与 steps 的合计 ${stepEdits} 不一致`);
    const lines = [`已执行 ${typedSkill} · ${MODE_LABELS[typedMode]}`, files.map((file) => file.path).join('、')];
    if (fileEdits === 0) {
        lines.push('改了 0 处');
    }
    else {
        lines.push(`改了 ${fileEdits} 处：` + steps.map((step) => `${stepLabel(typedSkill, step.name)} ${step.edits}`).join('，'));
    }
    if (held.length > 0)
        lines.push('未改：' + held.map((item) => HELD_LABELS[item]).join('、'));
    const checksText = checkLine(checks);
    if (checksText)
        lines.push(checksText);
    return { receipt: lines.join('\n') };
}
const RESULT_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: { receipt: { type: 'string' } },
    required: ['receipt'],
};
export function registerPassReportTool(tools) {
    tools.register({
        name: 'quarto_pass_report',
        description: '一次写作或主题润色收尾时调用一次，出一张短回执卡片：执行了哪个技能、什么模式、改了哪些文件与步骤、未改项、检查结论。入参是闭集：skill、mode、files（最多 8 个，每条带 path 与 edits）、steps（写作 1-9，主题用定表面/定字体/定尺度/定颜色/定组件/通过检查，各带 edits，合计必须等于 files 的 edits 合计）、held、checks、skip_reason。没改也传 0；不适用时 executed:false、mode:skipped、给 skip_reason。卡片就是回执，不要在回复里再复述。',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                skill: { type: 'string', enum: [...PASS_SKILLS] },
                executed: { type: 'boolean' },
                mode: { type: 'string', enum: [...PASS_MODES] },
                files: {
                    type: 'array',
                    maxItems: MAX_FILES,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            path: { type: 'string' },
                            edits: { type: 'integer', minimum: 0 },
                        },
                        required: ['path', 'edits'],
                    },
                },
                steps: {
                    type: 'array',
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            name: { type: 'string' },
                            edits: { type: 'integer', minimum: 1 },
                        },
                        required: ['name', 'edits'],
                    },
                },
                held: { type: 'array', items: { type: 'string', enum: [...HELD_ITEMS] } },
                checks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            name: { type: 'string', enum: [...CHECK_NAMES] },
                            status: { type: 'string', enum: [...CHECK_STATUSES] },
                        },
                        required: ['name', 'status'],
                    },
                },
                skip_reason: { type: 'string', maxLength: MAX_SKIP_REASON },
            },
            required: ['skill', 'executed', 'mode'],
        },
        output: {
            schema: RESULT_SCHEMA,
            render: (_args, value) => [{ type: 'text', text: value.receipt }],
            presentationMeta: (_args, value) => ({ summary: value.receipt.split('\n')[0], lines: value.receipt.split('\n') }),
        },
        async execute(args) {
            return buildPassReport(args);
        },
        presentCall(args) {
            const files = Array.isArray(args.files) ? args.files : [];
            return {
                card: 'generic',
                title: '写作回执',
                kind: 'execute',
                locations: files.map((file) => ({ path: String(file.path) })),
                rawInput: `${args.skill} · ${args.mode}`,
                content: [
                    {
                        type: 'text',
                        text: args.executed === false ? `${args.skill}：未执行` : `${args.skill} · ${args.mode}（${files.length} 个文件）`,
                    },
                ],
            };
        },
        presentResult(_args, result) {
            return {
                card: 'generic',
                title: '写作回执',
                content: result.content,
            };
        },
    });
}
