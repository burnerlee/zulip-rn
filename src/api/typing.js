/* @flow strict-local */
import type { ApiResponse, Auth } from './transportTypes';
import { apiPost } from './apiFetch';

/**
 * The type of operation for typing notifications.
 */
type TypingOperation = 'start' | 'stop';

/**
 * The type of message for sending messages.
 */
type MessageType = 'direct';

/**
 * See https://zulip.com/api/set-typing-status
 */
export default (
  auth: Auth,
  recipients: string,
  operation: TypingOperation,
  type: MessageType = 'direct',
): Promise<ApiResponse> =>
  apiPost(auth, 'typing', {
    to: recipients,
    op: operation,
    type,
  });
