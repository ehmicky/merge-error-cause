import wrapErrorMessage from 'wrap-error-message'

// Merge parent and child error messages
export const mergeMessage = ({ parent, child, target, stackError }) => {
  const parentMessage = parent.message
  const stackErrorMessage = stackError.message
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  target.message = child.message
  return wrapErrorMessage(target, parentMessage, stackErrorMessage)
}
