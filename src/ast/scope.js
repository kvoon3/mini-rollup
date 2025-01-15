import { toArray } from 'src/utils'

export default class Scope {
  /**
   * @param {{ parent?: Scope; names?: string[]; block?: boolean; }} [options]
   */
  constructor(options) {
    options = options || {}

    this.parent = options.parent
    this.depth = this.parent ? this.parent.depth + 1 : 0
    this.names = options.names || []
    this.isBlockScope = !!options.block
  }

  /**
   * @param {string | string[]} name
   * @param {boolean} [isBlockDeclaration]
   */
  add(name, isBlockDeclaration = false) {
    const names = toArray(name)
    if (!isBlockDeclaration && this.isBlockScope) {
      // it's a `var` or function declaration, and this
      // is a block scope, so we need to go up
      this.parent?.add(name, isBlockDeclaration)
    }
    else {
      for (const name of names) {
        this.names.push(name)
      }
    }
  }

  /**
   * @param {string} name
   */
  contains(name) {
    return !!this.findDefiningScope(name)
  }

  /**
   * @param {string} name
   */
  findDefiningScope(name) {
    if (~this.names.indexOf(name)) {
      return this
    }

    if (this.parent) {
      return this.parent.findDefiningScope(name)
    }

    return null
  }
}
