/**
 * ProgramBody
 *
 * @typedef {Array<import('acorn').Program['body'][number] & {
 * _included: boolean
 * _module: import('../Module').default
 * _source: import('magic-string').default
 * }>} ProgramBody
 */

/**
 * Ast
 *
 * @typedef {Omit<import('acorn').Program, 'body'> & {
 * body: ProgramBody
 * }} Ast
 */

/**
 *
 * @param {import('acorn').Program} ast
 * @param {import('magic-string').default} code
 * @param {import('../Module').default} module
 */
export function analyse(ast, code, module) {
  // ast statement <- self module, self source code
  ast.body.forEach((statement) => {
    Object.defineProperties(statement, {
      _included: { value: false, writable: true }, // whether include in result
      _module: { value: module },
      _source: { value: code.snip(statement.start, statement.end) },
    })
  })
}
