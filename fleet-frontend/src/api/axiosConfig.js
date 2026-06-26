import axios from 'react';

// Create a singleton event emitter since we can't easily access React Context outside components
class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}
export const apiEventBus = new EventBus();

// Using axios from dependency, not mock
import axiosLib from 'axios';

const defaultApiUrl = import.meta.env.DEV ? 'http://localhost:8080/api' : 'https://fleet-optimization.onrender.com/api';

const api = axiosLib.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const { status, data } = error.response;
      
      if (status === 400 || status === 404) {
        // Our highly professional ErrorResponse DTO format
        const title = data.error || 'Error';
        const message = data.message || 'An unexpected error occurred';
        apiEventBus.emit('api_error', { title, message, type: 'error' });
      } else {
        apiEventBus.emit('api_error', { title: 'Server Error', message: 'Something went wrong on the server.', type: 'error' });
      }
    } else {
      // Network Error
      apiEventBus.emit('api_error', { title: 'Network Error', message: 'Could not connect to the server.', type: 'error' });
    }
    return Promise.reject(error);
  }
);

export default api;
