import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { apiEventBus } from './axiosConfig';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = [];
  }

  connect() {
    if (this.client && this.client.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-fleet'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSockets', frame);
      
      // Subscribe to alerts topic
      this.client.subscribe('/topic/alerts', (message) => {
        if (message.body) {
          const payload = JSON.parse(message.body);
          
          // Notify local subscribers (e.g. Dashboard feed)
          this.subscribers.forEach(sub => sub(payload));
          
          // Show global toast if it has a delay reason
          if (payload.delayReason) {
            apiEventBus.emit('api_error', { 
              title: 'CRITICAL ALERT', 
              message: payload.delayReason, 
              type: 'warning' 
            });
          }
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  subscribeToAlerts(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}

export const wsService = new WebSocketService();
