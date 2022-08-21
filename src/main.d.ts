import type setErrorProps from 'set-error-props'

type NormalizeError<ErrorArg> = ErrorArg extends Error ? ErrorArg : Error

type SetErrorProps<ErrorArg, Cause extends object> = ReturnType<
  typeof setErrorProps<ErrorArg, Cause, { lowPriority: true }>
>

type MergeErrorCause<ErrorArg> = 'cause' extends keyof ErrorArg
  ? Omit<
      ErrorArg['cause'] extends object
        ? SetErrorProps<NormalizeError<ErrorArg>, ErrorArg['cause']>
        : NormalizeError<ErrorArg>,
      'cause'
    >
  : NormalizeError<ErrorArg>

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
): MergeErrorCause<ErrorArg>
