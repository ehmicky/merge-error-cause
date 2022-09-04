// Allow parent to re-use child's error class if either:
//  - Parent class is generic `Error`
//  - Parent `error.wrap` is `true`
// Instead of modifying the parent's prototype, we modify and return the child
// class instead.
//  - This is because modifying an instance prototype is hacky, as the instance
//    would have a prototype different from the constructor it called
export const getWrap = function (parent) {
  const { wrap, name } = parent

  if (typeof wrap !== 'boolean') {
    return name === 'Error'
  }

  if (isOwn.call(parent, 'wrap')) {
    // eslint-disable-next-line no-param-reassign, fp/no-delete
    delete parent.wrap
  }

  return wrap
}

const { hasOwnProperty: isOwn } = Object.prototype
