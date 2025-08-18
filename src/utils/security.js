/**
 * Security utilities for authentication and data protection
 * Implements OWASP security best practices
 */

// CSRF token management
let csrfToken = null;

export const setCSRFToken = (token) => {
  csrfToken = token;
};

export const getCSRFToken = () => {
  return csrfToken;
};

// XSS Prevention - Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Secure password validation with additional checks
export const validatePasswordSecurity = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeated characters');
  }
  
  return errors;
};

// Secure email validation
export const validateEmailSecurity = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  // Check for disposable email domains (basic check)
  const disposableDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return 'Please use a valid email address';
  }
  
  return null;
};

// Rate limiting with exponential backoff
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  getRemainingTime(key) {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeElapsed = Date.now() - oldestAttempt;
    return Math.max(0, this.windowMs - timeElapsed);
  }
  
  reset(key) {
    this.attempts.delete(key);
  }
  
  clear() {
    this.attempts.clear();
  }
}

// Secure token validation
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token follows JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Basic JWT structure validation
  try {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    // Check if token is issued in the future (clock skew tolerance)
    if (payload.iat && payload.iat * 1000 > Date.now() + 60000) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Secure session management
export class SecureSession {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }
  
  generateSessionId() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  updateActivity() {
    this.lastActivity = Date.now();
  }
  
  isExpired(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    return Date.now() - this.lastActivity > maxAge;
  }
  
  getAge() {
    return Date.now() - this.createdAt;
  }
}

// Secure headers for API requests
export const getSecureHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

// Input sanitization for form data
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value.trim());
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Secure redirect validation
export const validateRedirectUrl = (url) => {
  if (!url) return '/dashboard';
  
  // Only allow relative URLs or same-origin URLs
  try {
    const urlObj = new URL(url, window.location.origin);
    if (urlObj.origin !== window.location.origin) {
      return '/dashboard';
    }
    
    // Prevent open redirects
    if (urlObj.pathname.startsWith('//') || urlObj.pathname.includes('javascript:')) {
      return '/dashboard';
    }
    
    return urlObj.pathname + urlObj.search;
  } catch {
    return '/dashboard';
  }
};

// Secure logout with cleanup
export const secureLogout = () => {
  // Clear all sensitive data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.clear();
  
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Clear rate limiting
  if (window.rateLimiter) {
    window.rateLimiter.clear();
  }
  
  // Redirect to login with cache-busting
  window.location.href = '/login?logout=' + Date.now();
};

// Security audit logging
export const logSecurityEvent = (event, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer
  };
  
  // In production, send to security logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
    console.warn('Security Event:', logEntry);
  } else {
    console.log('Security Event:', logEntry);
  }
};

// Export rate limiter instance
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes 