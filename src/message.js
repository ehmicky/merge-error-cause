// Merge parent and child error messages.
// By default, parent messages are appended
//  - This is because the innermost message is the most relevant one which
//    should be read first by users
//  - However, the parent can opt-in to being prepended instead by ending
//    with `:`, optionally followed by a newline.
// Each error message is on its own line, for clarity.
// Empty messages are ignored
//  - This is useful when wrapping an error properties, but not message
export const mergeMessage = function (rawParentMessage, rawChildMessage) {
  const parentMessage = rawParentMessage.trim()
  const childMessage = rawChildMessage.trim()

  if (parentMessage === '') {
    return childMessage
  }

  if (childMessage === '') {
    return parentMessage
  }

  return concatMessages(parentMessage, childMessage, rawParentMessage)
}

const concatMessages = function (
  parentMessage,
  childMessage,
  rawParentMessage,
) {
  if (!parentMessage.endsWith(PREPEND_CHAR)) {
    return `${childMessage}\n${parentMessage}`
  }

  return rawParentMessage.endsWith(PREPEND_NEWLINE_CHAR)
    ? `${parentMessage}\n${childMessage}`
    : `${parentMessage} ${childMessage}`
}

const PREPEND_CHAR = ':'
const PREPEND_NEWLINE_CHAR = '\n'
