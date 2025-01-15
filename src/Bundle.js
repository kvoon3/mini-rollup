import { readFile, writeFile } from 'node:fs/promises'
import { Bundle as MagicStringBundle } from 'magic-string'
import Module from './Module.js'

/**
 * @typedef {object} Option
 * @property {string} entryPath
 */

export default class Bundle {
  entryPath
  /**
   *
   * @param {Option} opts
   */
  constructor(opts) {
    const { entryPath } = opts
    this.entryPath = entryPath
  }

  /**
   *
   * @param {string} output
   */
  async build(output) {
    const entryModule = await this.fetchModule(this.entryPath)

    const allStatement = entryModule.expandAllStatement()

    const { code } = this.generate(allStatement)

    await writeFile(output, code)
  }

  /**
   *
   * @param {import('./ast/analyse').ProgramBody} statements
   */
  generate(statements) {
    const bundle = new MagicStringBundle({
      separator: '\n\n',
    })

    statements.forEach((statement) => {
      const source = statement._source.clone()

      bundle.addSource({
        content: source,
      })
    })

    return { code: bundle.toString() }
  }

  /**
   * @param {string} importee - module path
   */
  async fetchModule(importee) {
    const code = (await readFile(importee)).toString()
    return new Module({
      code,
      path: importee,
      bundle: this,
    })
  }
}
