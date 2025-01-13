import path from 'node:path'
import Bundle from './Bundle'

const entryPath = path.resolve(import.meta.dirname, '../playground/src/index.js')
const output = path.resolve(import.meta.dirname, '../playground/dist/index.js')

/**
 *
 * @param {string} input
 * @param {string} output
 */
function rollup(input, output) {
  new Bundle({
    entryPath: input,
  })
    .build(output)
}

rollup(entryPath, output)
