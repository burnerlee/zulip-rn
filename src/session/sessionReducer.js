/* @flow strict-local */
// Importing necessary types and functions
import type { GlobalState } from '../reduxTypes';
import type { Orientation, Action } from '../types';
import { keyOfIdentity } from '../account/accountMisc';
import { getIdentity, tryGetActiveAccountState } from '../account/accountsSelectors';
import {
  REHYDRATE,
  DEAD_QUEUE,
  RESET_ACCOUNT_DATA,
  // Action constants for various session-related actions
  APP_ONLINE,
  REGISTER_START,
  REGISTER_ABORT,
  REGISTER_COMPLETE,
  APP_ORIENTATION,
  TOGGLE_OUTBOX_SENDING,
  // Action constants for push token management
  GOT_PUSH_TOKEN,
  DISMISS_SERVER_COMPAT_NOTICE,
  REGISTER_PUSH_TOKEN_START,
  REGISTER_PUSH_TOKEN_END,
} from '../actionConstants';

// Type definition for per-account session state
/**
 * Miscellaneous non-persistent state specific to a particular account.
 *
 * See {@link SessionState} for discussion of what "non-persistent" means.
 */
export type PerAccountSessionState = $ReadOnly<{
  /**
   * The event queue ID that we're currently polling on, if any.
   *
   * Null when we're not polling on any event queue:
   * - Between startup and registering a queue
   * - After the server tells us our old queue was invalid, and before we've
   *   registered a new one
   * - While this account is logged out
   */
  eventQueueId: string | null,

  /**
   * Indicates if the /register request is in progress.
   * This happens on startup, or on re-init following a dead event
   * queue after 10 minutes of inactivity.
   */
  loading: boolean,

  outboxSending: boolean,

  /**
   * Indicates if the ServerCompatBanner has been dismissed this session.
   * We put this in the per-session state deliberately, so that users
   * see the notice on every startup until the server is upgraded.
   * That's a better experience than not being able to load the realm
   * on mobile at all, which is what will happen soon if the user
   * doesn't act on the notice.
   */
  hasDismissedServerCompatNotice: boolean,

  /**
   * Number of push token registration requests in progress.
   */
  registerPushTokenRequestsInProgress: number,

  ...
}>;

// Type definition for global session state
/**
 * Miscellaneous non-persistent state independent of account.
 *
 * This contains data about the device and the app as a whole, independent
 * of any particular Zulip server or account.
 *
 * See {@link SessionState} for discussion of what "non-persistent" means.
 */
export type GlobalSessionState = $ReadOnly<{
  // `null` if we don't know. See the place where we set this, for what that
  // means.
  isOnline: boolean | null,

  isHydrated: boolean,

  // Current orientation of the app
  orientation: Orientation,

  /**
   * Our actual device token, as most recently learned from the system.
   *
   * With FCM/GCM this is the "registration token"; with APNs the "device
   * token".
   *
   * This is `null` before we've gotten a token. On Android, we may also receive
   * an explicit `null` token if the device can't or won't give us a real one.
   *
   * See upstream docs for more details.
   *   https://firebase.google.com/docs/cloud-messaging/android/client#sample-register
   *   https://developers.google.com/cloud-messaging/android/client
   *   https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns
   *
   * See also discussion at https://stackoverflow.com/q/37517860.
   */
  pushToken: string | null,

  ...
// Type definition for session state combining global and per-account states
/**
 * Miscellaneous non-persistent state about this run of the app.
 *
 * These state items are stored in `session.state`, and 'session' is
 * in `discardKeys` in src/boot/store.js. That means these values
 * won't be persisted between sessions; on startup, they'll all be
 * initialized to their default values.
 */
export type SessionState = $ReadOnly<{|
  ...$Exact<GlobalSessionState>,
  ...$Exact<PerAccountSessionState>,
|}>;

// Initial state for global session
const initialGlobalSessionState: $Exact<GlobalSessionState> = {
  // This will be `null` on startup, while we wait to hear `true` or `false`
  // from the native module over the RN bridge; so, have it start as `null`.
  isOnline: null,

  isHydrated: false,
  orientation: 'PORTRAIT',
  pushToken: null,
// Initial state for per-account session
/** PRIVATE; exported only for tests. */
export const initialPerAccountSessionState: $Exact<PerAccountSessionState> = {
  eventQueueId: null,
  loading: false,
  outboxSending: false,
  hasDismissedServerCompatNotice: false,
  registerPushTokenRequestsInProgress: 0,
};

// Combined initial state
const initialState: SessionState = {
  ...initialGlobalSessionState,
  ...initialPerAccountSessionState,
};

// Reducer function handling session-related actions
export default (
  state: SessionState = initialState, // eslint-disable-line default-param-last
  action: Action,
  globalState: GlobalState,
): SessionState => {
  switch (action.type) {
    // Handle DEAD_QUEUE action
    case DEAD_QUEUE:
      return {
        ...state,
        loading: false,

        // The server told us that the old queue ID is invalid. Forget it,
        // so we don't try to use it.
        // Reset eventQueueId to null
        eventQueueId: null,
      };

    case RESET_ACCOUNT_DATA:
      return {
        ...state,

        // Clear per-account session state
        // Importantly, stop polling on the
        // account's current event queue if we had one. In the polling loop,
        // after each server response, we check if we've dropped the queue
        // ID from this state and break out if so.
        ...initialPerAccountSessionState,
      };

    // Handle REHYDRATE action
    case REHYDRATE:
      return {
        ...state,
        isHydrated: true,
      };

    // Handle REGISTER_COMPLETE action
    case REGISTER_COMPLETE:
      return {
        ...state,
        loading: false,
        eventQueueId: action.data.queue_id,
      };

    // Handle APP_ONLINE action
    case APP_ONLINE:
      return {
        ...state,
        isOnline: action.isOnline,
      };

    // Handle REGISTER_START action
    case REGISTER_START:
      return {
        ...state,
        loading: true,
      };

    // Handle REGISTER_ABORT action
    case REGISTER_ABORT:
      return {
        ...state,
        loading: false,
      };

    // Handle APP_ORIENTATION action
    case APP_ORIENTATION:
      return {
        ...state,
        orientation: action.orientation,
      };

    // Handle GOT_PUSH_TOKEN action
    case GOT_PUSH_TOKEN:
      return {
        ...state,
        pushToken: action.pushToken,
      };

    // Handle REGISTER_PUSH_TOKEN_START action
    case REGISTER_PUSH_TOKEN_START: {
      // TODO(#5006): Do for any account, not just the active one
      const activeAccountState = tryGetActiveAccountState(globalState);
      if (
        !activeAccountState
        || keyOfIdentity(action.identity) !== keyOfIdentity(getIdentity(activeAccountState))
      ) {
        return state;
      }
      // Increment registerPushTokenRequestsInProgress
      return {
        ...state,
        registerPushTokenRequestsInProgress: state.registerPushTokenRequestsInProgress + 1,
      };
    }

    // Handle REGISTER_PUSH_TOKEN_END action
    case REGISTER_PUSH_TOKEN_END: {
      // TODO(#5006): Do for any account, not just the active one
      const activeAccountState = tryGetActiveAccountState(globalState);
      if (
        !activeAccountState
        || keyOfIdentity(action.identity) !== keyOfIdentity(getIdentity(activeAccountState))
      ) {
        return state;
      }
      // Decrement registerPushTokenRequestsInProgress
      return {
        ...state,
        registerPushTokenRequestsInProgress: state.registerPushTokenRequestsInProgress - 1,
      };
    }

    // Handle TOGGLE_OUTBOX_SENDING action
    case TOGGLE_OUTBOX_SENDING:
      return { ...state, outboxSending: action.sending };

    case DISMISS_SERVER_COMPAT_NOTICE:
      return {
        ...state,
        // Mark hasDismissedServerCompatNotice as true
        hasDismissedServerCompatNotice: true,
      };

    default:
      return state;
  }
};
