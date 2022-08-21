// Allow parent to re-use child's error type if either:
//  - Parent type is generic `Error`
//  - Parent as property `wrap: true`
// We do this by setting `parent.__proto__` to `child.__proto__`
//  - This might create some issues due to parent having a prototype from a
//    class, but not having called its constructor.
//     - For `Error`, this is very rare though.
export const mergePrototype = function (parent, child) {
  if (!shouldMergePrototype(parent)) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  Object.setPrototypeOf(parent, Object.getPrototypeOf(child))
  fixPrototypeProps(parent, child)
}

const shouldMergePrototype = function ({ name, wrap }) {
  return name === 'Error' || wrap === true
}

// We ensure that some prototype's properties are copied over:
//  - `error.constructor` is expected to match prototype
//  - `error.name` is expected to match `error.constructor.name`
// Even after copying the prototype, those might mismatch if either:
//  - They are set as own property in `parent`, since own properties have higher
//    priority over properties inherited from the prototype
//  - The property is usually set on prototypes, but is actually set as an own
//    property in child instead. This is a common mistake for `error.name`.
const fixPrototypeProps = function (parent, child) {
  PROTOTYPE_PROPS.forEach((propName) => {
    fixPrototypeProp(parent, child, propName)
  })
}

const PROTOTYPE_PROPS = ['constructor', 'name']

const fixPrototypeProp = function (parent, child, propName) {
  if (parent[propName] !== child[propName]) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    parent[propName] = child[propName]
  }
}
