/**
 * @param {any} val
 */
export function toArray(val) {
  return Array.isArray(val)
    ? val
    : [val]
}

/**
 * NOTE: only care about 'Identifier' type now
 *
 * @param {import('acorn').AnyNode} node
 */
export function getName(node) {
  if (node.type === 'Identifier')
    return node.name
  else
    return ''
}
