import { getAccessToken } from './auth';

/**
 * WebSocket service for real-time notifications
 * Handles connection, authentication, reconnection, and message routing
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 30000; // 30 seconds
    this.listeners = new Map();
    this.isConnecting = false;
    this.isConnected = false;
    this.baseURL = null;
    this.wsURL = null;
  }

  /**
   * Initialize WebSocket connection
   * @param {string} baseURL - API base URL (e.g., http://localhost:8000/api)
   * @param {string} wsPath - WebSocket path (default: /ws/notifications/)
   */
  initialize(baseURL, wsPath = '/ws/notifications/') {
    if (this.baseURL === baseURL && this.wsPath === wsPath && this.isConnected) {
      return; // Already connected to this URL
    }

    this.baseURL = baseURL;
    this.wsPath = wsPath;
    // Convert HTTP/HTTPS URL to WS/WSS
    const wsProtocol = baseURL.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseURL.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    this.wsURL = `${wsProtocol}://${wsHost}${wsPath.startsWith('/') ? wsPath : '/' + wsPath}`;
    
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnecting || (this.isConnected && this.ws?.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const token = getAccessToken();
    
    if (!token) {
      console.warn('WebSocket: No access token available, cannot connect');
      this.isConnecting = false;
      return;
    }

    try {
      // Include token in query string or headers (adjust based on your backend)
      const url = `${this.wsURL}?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Notify listeners
    this.emit('connected', {});
  }

  /**
   * Handle WebSocket message event
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      if (data.type === 'pong') {
        // Heartbeat response
        return;
      }
      
      if (data.type === 'notification') {
        this.emit('notification', data.payload);
      } else if (data.type === 'unread_count') {
        this.emit('unread_count', data.payload);
      } else if (data.type === 'notification_created') {
        this.emit('notification_created', data.payload);
      } else if (data.type === 'notification_updated') {
        this.emit('notification_updated', data.payload);
      } else if (data.type === 'notification_deleted') {
        this.emit('notification_deleted', data.payload);
      } else {
        // Generic message
        this.emit('message', data);
      }
    } catch (error) {
      console.error('WebSocket message parse error:', error, event.data);
    }
  }

  /**
   * Handle WebSocket error event
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  /**
   * Handle WebSocket close event
   */
  handleClose(event) {
    console.log('WebSocket closed', event.code, event.reason);
    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();
    
    // Notify listeners
    this.emit('disconnected', { code: event.code, reason: event.reason });
    
    // Handle authentication errors (401, 403) - token might be invalid
    if (event.code === 1008 || event.code === 4003 || event.code === 4001) {
      // Authentication error - try to reconnect with fresh token
      console.log('WebSocket: Authentication error, will reconnect with fresh token');
      this.reconnectAttempts = 0; // Reset attempts for auth errors
      this.scheduleReconnect();
    } else if (event.code !== 1000) {
      // Attempt to reconnect for other non-normal closures
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached');
      this.emit('reconnect_failed', {});
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatIntervalMs);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket: Cannot send message, connection not open');
    }
  }

  /**
   * Subscribe to WebSocket events
   * @param {string} event - Event name (e.g., 'notification', 'unread_count')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Reconnect WebSocket (useful after token refresh)
   */
  reconnect() {
    if (this.baseURL) {
      this.disconnect();
      // Small delay to ensure clean disconnect
      setTimeout(() => {
        this.connect();
      }, 100);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    // Don't clear listeners on disconnect - they might want to reconnect
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      readyState: this.ws?.readyState,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
