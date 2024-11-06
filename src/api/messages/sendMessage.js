/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/send-message */
export default async (
  auth: Auth,
  params: {|  
    type: 'private' | 'stream',
    to: string,
    // TODO(server-2.0): Say "topic", not "subject"
    subject?: string,
    content: string,
    localId?: number,
    eventQueueId?: string,
  |},
  zulipFeatureLevel: number,
): Promise<ApiResponse> => {
  // Determine the message type to use based on the server's feature level.
  // For servers with feature level 174 or higher, use 'direct' for private messages.
  const messageType = zulipFeatureLevel >= 174 && params.type === 'private' ? 'direct' : params.type;

  return apiPost(auth, 'messages', {
    type: messageType, // Use the determined message type.
    to: params.to,
    subject: params.subject,
    content: params.content,
    local_id: params.localId,
    queue_id: params.eventQueueId,
  });
};
