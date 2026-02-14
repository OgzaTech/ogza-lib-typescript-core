/**
 * Application Event Types
 * Magic string yerine constant kullan
 */
export const EventTypes = {
  // User Events
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  
  // UI Events (Frontend)
  THEME_CHANGED: 'ui.theme_changed',
  LANGUAGE_CHANGED: 'ui.language_changed',
  NOTIFICATION_RECEIVED: 'ui.notification_received',
  
  // System Events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
  SYSTEM_INFO: 'system.info',
  
  // Data Events
  DATA_LOADED: 'data.loaded',
  DATA_SAVED: 'data.saved',
  DATA_DELETED: 'data.deleted',
  
  // WebSocket Events (Frontend)
  WS_CONNECTED: 'websocket.connected',
  WS_DISCONNECTED: 'websocket.disconnected',
  WS_MESSAGE_RECEIVED: 'websocket.message_received',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];