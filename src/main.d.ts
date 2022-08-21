/**
 * This merges
 * [`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
 * recursively with its parent `error`, including its
 * [`message`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message),
 * [`stack`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack),
 * [`name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name)
 * and
 * [`errors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError).
 *
 * @example
 * ```js
 * const main = function (userId) {
 *   try {
 *     return createUser(userId)
 *   } catch (error) {
 *     throw mergeErrorCause(error)
 *     // Printed as:
 *     //   TypeError: Invalid user id: false
 *     //   Could not create user.
 *   }
 * }
 *
 * const createUser = function (userId) {
 *   try {
 *     validateUserId(userId)
 *     return sendDatabaseRequest('create', userId)
 *   } catch (cause) {
 *     throw new Error('Could not create user.', { cause })
 *   }
 * }
 *
 * const validateUserId = function (userId) {
 *   if (typeof userId !== 'string') {
 *     throw new TypeError(`Invalid user id: ${userId}.`)
 *   }
 * }
 *
 * main(false)
 * ```
 */
export default function mergeErrorCause<ErrorArg>(
  error: ErrorArg,
): Omit<ErrorArg, 'cause'>
