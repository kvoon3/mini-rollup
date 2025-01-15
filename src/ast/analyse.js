import { getName } from '../utils'
import Scope from './scope'
import { walker } from './walker'

/**
 * RollupExtraNodeInfo
 *
 * @typedef {{
 * _included: boolean
 * _module: import('../Module').default
 * _source: import('magic-string').default
 * _dependOn: Record<string, boolean>
 * _defines: Record<string, boolean>
 * }} RollupExtraNodeInfo
 */

/**
 * ProgramBody
 *
 * @typedef {Array<
 * import('acorn').Program['body'][number]
 * & RollupExtraNodeInfo
 * >} ProgramBody
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
 * @param {import('./analyse').Ast} ast
 * @param {import('magic-string').default} code
 * @param {import('../Module').default} module
 */
export function analyse(ast, code, module) {
  /**
   * 1. ast statement <- self module, self source code
   * 2. self module <- imports, exports
   */

  for (const statement of ast.body) {
    // Set rollup extra info
    Object.defineProperties(statement, {
      _included: { value: false, writable: true }, // whether include in result
      _module: { value: module },
      _source: { value: code.snip(statement.start, statement.end) },
      _dependOn: { value: {}, writable: true }, // [statement name]: is depend on this statement
      _defines: { value: {} }, // [var name]: is top level var
    })

    /**
     * import { toggleDark as switchDark } from '~/state'
     * module.imports === { switchDark: {source: '~/state', importedName: toggleDark}, }
     */
    if (statement.type === 'ImportDeclaration') {
      const source = statement.source.value

      for (const i of statement.specifiers) {
        if (i.type === 'ImportSpecifier') {
          const importedName = getName(i.imported)
          const localName = i.local.name
          module.imports[localName] = { source, importedName }
        }
      }
    }

    /**
     * module.exports
     */
    if (statement.type === 'ExportNamedDeclaration') {
      const { declaration, specifiers } = statement

      // export const foo = 'bar'
      if (declaration?.type === 'VariableDeclaration') {
        const { declarations } = declaration
        // const foo, bar = 'baz'
        for (const i of declarations) {
          const exportedName = getName(i.id)
          const localName = getName(i.id)
          module.exports[localName] = { exportedName }
        }
      }

      /**
       * export {
       *  foo,
       *  bar as baz,
       * }
       */
      for (const i of specifiers) {
        if (i.type === 'ExportSpecifier') {
          const exportedName = getName(i.exported)
          const localName = getName(i.local)
          module.exports[exportedName] = { localName }
        }
      }
    }
  }

  /**
   * build scope chain
   *
   * - for collect _defines(used top level vars) and definitions(used top level statements)
   */

  let curScope = new Scope()
  ast.body.forEach((statement) => {
    function addToScope(name = '') {
      curScope.add(name)
      // NOTE: we only care about vars that in top level scope
      if (!curScope.parent) {
        statement._defines[name] = true
        module.definitions[name] = statement
      }
    }

    walker(statement, {
      enter(node) {
        /** @type {Scope | null} */
        let maybeNewScope = null

        if (node.type === 'Identifier')
          statement._dependOn[node.name] = true

        if (node.type === 'FunctionDeclaration') {
          addToScope(node.id?.name)

          // function params
          const names = node.params.map(param =>
            param.type === 'Identifier'
              ? param.name
              : '',
          )

          maybeNewScope = new Scope({
            parent: curScope,
            names,
          })
        }
        else if (node.type === 'VariableDeclaration') {
          for (const declaration of node.declarations) {
            if (declaration.id.type === 'Identifier')
              addToScope(declaration.id.name)
          }
        }

        // tag scope to statement
        if (maybeNewScope) {
          Object.defineProperty(node, '_scope', {
            value: maybeNewScope,
          })

          curScope = maybeNewScope
        }
      },
      leave(node) {
        if (
          Object.hasOwn(node, '_scope')
          && curScope.parent
        ) {
          curScope = curScope.parent
        }
      },
    })
  })
}
