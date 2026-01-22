# WebSocket Notifications Implementation Guide

## Overview

This application uses WebSocket connections for real-time notifications instead of polling API endpoints. This provides instant updates, reduces server load, and improves user experience.

## Architecture

### Components

1. **WebSocket Service** (`src/utils/websocket-service.js`)
   - Singleton service managing WebSocket connection lifecycle
   - Handles connection, reconnection, heartbeat, and message routing
   - Supports multiple event listeners

2. **useNotificationsWebSocket Hook** (`src/hooks/useNotificationsWebSocket.js`)
   - React hook for managing WebSocket connection in components
   - Automatically connects/disconnects on mount/unmount
   - Integrates with Redux store for state management

3. **useSyncCompletedPolling Hook** (`src/hooks/useSyncCompletedPolling.js`)
   - Listens for `sync_completed` notifications via WebSocket
   - Shows toast notifications when sync completes
   - Replaces previous polling mechanism

4. **NotificationBell Component** (`src/components/ui/NotificationBell.jsx`)
   - Uses WebSocket for real-time unread count updates
   - No longer polls `/notifications/unread-count/` endpoint

## WebSocket Endpoint

The WebSocket connects to:
- **URL Pattern**: `ws://host/ws/notifications/` or `wss://host/ws/notifications/`
- **Authentication**: Token passed as query parameter: `?token=<access_token>`
- **Protocol**: Automatically uses `wss` for HTTPS and `ws` for HTTP

### Configuration

The WebSocket URL is derived from `VITE_API_URL` environment variable:
- If `VITE_API_URL=http://localhost:8000/api`, WebSocket connects to `ws://localhost:8000/ws/notifications/`
- If `VITE_API_URL=https://api.example.com/api`, WebSocket connects to `wss://api.example.com/ws/notifications/`

## Message Format

The backend should send messages in the following JSON format:

```json
{
  "type": "notification_created",
  "payload": {
    "id": 123,
    "title": "Notification Title",
    "message": "Notification message",
    "notification_type": "sync_completed",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z",
    "metadata": {}
  }
}
```

### Supported Message Types

1. **notification_created** - New notification created
   ```json
   {
     "type": "notification_created",
     "payload": { /* notification object */ }
   }
   ```

2. **notification_updated** - Notification updated
   ```json
   {
     "type": "notification_updated",
     "payload": {
       "id": 123,
       "updates": { "is_read": true }
     }
   }
   ```

3. **notification_deleted** - Notification deleted
   ```json
   {
     "type": "notification_deleted",
     "payload": { "id": 123 }
   }
   ```

4. **unread_count** - Unread count update
   ```json
   {
     "type": "unread_count",
     "payload": { "unread_count": 5 }
   }
   ```

5. **ping/pong** - Heartbeat messages (handled automatically)

## Usage

### Basic Usage in Component

```jsx
import { useNotificationsWebSocket } from '../hooks/useNotificationsWebSocket';

function MyComponent() {
  // Automatically connects on mount, disconnects on unmount
  useNotificationsWebSocket({
    autoConnect: true,
    onNotification: (notification) => {
      console.log('New notification:', notification);
    },
    onUnreadCountChange: (count) => {
      console.log('Unread count:', count);
    },
  });

  return <div>...</div>;
}
```

### Manual Connection Control

```jsx
import { useNotificationsWebSocket } from '../hooks/useNotificationsWebSocket';

function MyComponent() {
  const { connect, disconnect, isConnected } = useNotificationsWebSocket({
    autoConnect: false,
  });

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

### Listening for Sync Completed Notifications

```jsx
import { useSyncCompletedPolling } from '../hooks/useSyncCompletedPolling';

function IntegrationsPage() {
  const { startPolling } = useSyncCompletedPolling();

  const handleSync = async () => {
    // Trigger sync...
    await triggerSync();
    
    // Start listening for sync completion via WebSocket
    startPolling();
  };

  return <div>...</div>;
}
```

### Direct WebSocket Service Usage

```jsx
import { websocketService } from '../utils/websocket-service';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Initialize connection
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    websocketService.initialize(baseURL);

    // Subscribe to events
    const unsubscribe = websocketService.on('notification_created', (notification) => {
      console.log('New notification:', notification);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <div>...</div>;
}
```

## Features

### Automatic Reconnection

- Exponential backoff: Starts at 1 second, doubles each attempt, max 30 seconds
- Max attempts: 5 reconnection attempts
- Resets on successful connection

### Heartbeat

- Sends ping every 30 seconds to keep connection alive
- Automatically handles pong responses

### Token Refresh Handling

When the access token is refreshed:
1. WebSocket detects authentication errors (401, 403)
2. Automatically reconnects with fresh token
3. Or manually call `websocketService.reconnect()` after token refresh

### Error Handling

- Connection errors are logged but don't break the app
- Failed messages are logged for debugging
- Graceful degradation if WebSocket is unavailable

## Backend Requirements

Your backend WebSocket server should:

1. **Accept token in query string**: `ws://host/ws/notifications/?token=<access_token>`
2. **Validate token**: Verify JWT token before accepting connection
3. **Send messages in expected format**: Use the message types documented above
4. **Handle ping/pong**: Respond to ping messages with pong
5. **Close with proper codes**: 
   - `1000` for normal closure
   - `1008` or `4003` for authentication errors
   - Other codes for other errors

### Example Django Channels Implementation

```python
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query string
        token = self.scope['query_string'].decode().split('token=')[1].split('&')[0]
        
        # Validate token
        if not self.validate_token(token):
            await self.close(code=4003)  # Authentication error
            return
        
        await self.accept()
        
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification_created',
            'payload': event['notification']
        }))
    
    async def send_unread_count(self, event):
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'payload': {'unread_count': event['count']}
        }))
```

## Migration from Polling

### Before (Polling)
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchUnreadCount());
  }, 45000); // Poll every 45 seconds
  
  return () => clearInterval(interval);
}, []);
```

### After (WebSocket)
```jsx
useNotificationsWebSocket({
  autoConnect: true,
});
// Real-time updates automatically handled
```

## Troubleshooting

### WebSocket Not Connecting

1. Check browser console for connection errors
2. Verify `VITE_API_URL` is set correctly
3. Ensure backend WebSocket server is running
4. Check token is valid and not expired
5. Verify CORS/WebSocket proxy settings

### Not Receiving Notifications

1. Check WebSocket connection status: `websocketService.getStatus()`
2. Verify backend is sending messages in correct format
3. Check browser console for message parsing errors
4. Ensure event listeners are properly subscribed

### Authentication Errors

1. Token might be expired - WebSocket will auto-reconnect
2. Check token format matches backend expectations
3. Verify token is included in query string correctly

## Performance Benefits

- **Reduced API calls**: No more polling every 12-45 seconds
- **Instant updates**: Notifications appear immediately
- **Lower server load**: One WebSocket connection vs. many HTTP requests
- **Better UX**: Real-time feedback for sync operations

## Security Considerations

1. **Token in query string**: Consider using headers if supported by your WebSocket library
2. **WSS in production**: Always use `wss://` (secure WebSocket) in production
3. **Token validation**: Backend must validate tokens on connection
4. **Rate limiting**: Consider rate limiting WebSocket connections
