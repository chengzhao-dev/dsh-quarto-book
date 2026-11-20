import { spawnSync } from 'node:child_process'

/** 找到可用的 Python 解释器；找不到时返回空串。 */
export function findPython() {
    for (const candidate of ['python3', 'python']) {
        if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
    }
    return ''
}
