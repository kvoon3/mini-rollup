import { parse } from 'acorn'
import MagicString from 'magic-string'
import { analyse } from './ast/analyse'

/** @typedef {import('./Bundle').default} Bundle */

/**
 * @typedef {object} Option
 * @property {string} code source code
 * @property {string} path module path
 * @property {Bundle} bundle belonging bundle
 */

export default class Module {
  code
  path
  bundle
  /**
   * @type {import('./ast/analyse').Ast}
   */
  ast
  /**
   *
   * @param {Option} opt
   */
  constructor(opt) {
    const { code, path, bundle } = opt
    this.path = path
    this.bundle = bundle

    this.code = new MagicString(code)
    // @ts-ignore - rollup added some own property in ast
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module',
    })
    analyse(this.ast, this.code, this)
  }

  expandAllStatement() {
    const allStatement = []
    this.ast.body.forEach((statement) => {
      const statements = this.expandStatement(statement)
      allStatement.push(...statements)
    })
    return allStatement
  }

  /**
   *
   * @param {import('./ast/analyse').ProgramBody[number]} statement
   */
  expandStatement(statement) {
    statement._included = true
    return [statement]
  }
}
