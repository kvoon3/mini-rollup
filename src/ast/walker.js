/**
 * @typedef {import('./analyse').ProgramBody[number] | import('acorn').AnyNode} Node
 */

/**
 * @typedef {(
 * node: Node,
 * parent: Node | null
 * ) => void} VisitCallback
 */

/**
 *
 * @param {Node} node
 * @param {{enter?: VisitCallback; leave?: VisitCallback}} hooks
 */
export function walker(node, { enter, leave }) {
  visit(node, null, enter, leave)
}

/**
 *
 * @param {Node} node
 * @param {Node | null} parent
 * @param {VisitCallback} [enter]
 * @param {VisitCallback} [leave]
 */
function visit(node, parent, enter, leave) {
  if (enter)
    enter(node, parent)

  const keys = Object.keys(node).filter(key => typeof node[key] === 'object')

  for (const key of keys) {
    const maybeSubnode = node[key]

    if (Array.isArray(maybeSubnode)) {
      for (const subnode of maybeSubnode) {
        visit(subnode, node, enter, leave)
      }
    }
    else if (maybeSubnode && maybeSubnode.type) {
      visit(maybeSubnode, node, enter, leave)
    }
  }

  if (leave)
    leave(node, parent)
}
