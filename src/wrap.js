// Allow parent to re-use child's error class if either:
//  - Parent class is generic `Error`
//  - Parent `error.wrap` is `true`
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
