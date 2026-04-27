// Automatically detect if running on localhost or network
const getApiUrl = () => {
  // In development, check if we're on localhost or IP
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    
    // If accessing via localhost, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    
    // If accessing via IP address, use that IP for backend
    return `http://${hostname}:8000`;
  }
  
  // In production, use environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const API_URL = getApiUrl();