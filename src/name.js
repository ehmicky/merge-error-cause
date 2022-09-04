import setErrorClass from 'set-error-class'

// Ensure `error.name` is reflected in `error.stack`
export const mergeName = function (target, stackError) {
  return setErrorClass(target, target.constructor, stackError.name)
}
