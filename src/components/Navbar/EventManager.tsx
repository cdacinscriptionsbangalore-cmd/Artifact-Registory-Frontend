import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
// import type { AxiosRequestConfig } from 'axios';
import { getCookie } from '@/utils/auth';
import { getEnvConfig } from '@/config/env';

let isRefreshing: boolean = false;
let refreshTokenPromise: Promise<boolean> | null = null;
let timeoutGlobelAction: () => void = () => {};
const eventHandlers: Record<string, Array<() => void>> = {};
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let handleUserActivity: (() => void) | null = null;
let lastValidationTime: number = 0;
const VALIDATION_THROTTLE_MS = 5000; // Only validate once every 5 seconds
const { backendApiUrl } = getEnvConfig();

// Utility function to delete a cookie by name
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
};

export const addEventHandler = (eventName: string, handler: () => void) => {
  if (!eventHandlers[eventName]) {
    eventHandlers[eventName] = [];
  }
  eventHandlers[eventName].push(handler);
};

export const removeEventHandler = (eventName: string, handler: () => void) => {
  if (eventHandlers[eventName]) {
    eventHandlers[eventName] = eventHandlers[eventName].filter(
      (existingHandler) => existingHandler !== handler
    );
  }
};

export const startSessionTimeout = (
  timeoutDuration: number,
  timeoutAction: () => void,
  activityEvents: string[]
) => {
  // console.log('l3', timeoutDuration);

  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    clearUserActivityTracking(activityEvents);
    timeoutAction();
  }, timeoutDuration);
};

// Store the JWT token and refresh token in cookies
export const storeJWTToken = (token: string, refreshToken: string) => {
  document.cookie = `token=${token}; path=/; SameSite=Strict; Secure`;
  // console.log("setting karega"+token);
  
};

export const getJWTToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const cookie = c.trim();
    if (cookie.startsWith('token=')) return cookie.substring(6);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const cookie = c.trim();
    if (cookie.startsWith('refresh=')) return cookie.substring(8);
  }
  return null;
};

const extendToken = (): Promise<boolean> => {
  // CRITICAL: Check and set the promise in the same synchronous block
  if (refreshTokenPromise) {
    // console.log('Refresh already in progress, waiting for existing request...');
    return refreshTokenPromise;
  }

  // console.log('Starting new token refresh request...');
  isRefreshing = true;

  // Set the promise IMMEDIATELY, before any async operations
  refreshTokenPromise = (async () => {
    try {
      const csrfResponse = await axios.get(
        `${backendApiUrl}oauth2/login/csrf-token`,
        {
          withCredentials: true,
        }
      );

      const csrfToken = csrfResponse.data.token;

      const response = await axios.post(
        `${backendApiUrl}oauth2/login/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
            'X-XSRF-TOKEN': csrfToken,
          },
        }
      );

      // if (response.status === 201) {
        storeJWTToken(response.data.token, '');
        // console.log('Token refreshed successfully');
      // }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      if ((error as any).response?.data?.http_status_code === 404) {
        deleteCookie('token');
      }
      throw false;
    } finally {
      // Clean up in finally block to ensure it always runs
      isRefreshing = false;
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

export const validateSession = async (): Promise<boolean> => {
  const activityEvents = [
    'mousemove',
    'click',
    'keydown',
    'scroll',
    'touchstart',
  ];

  // Throttle validation to prevent excessive calls
  const now = Date.now();
  if (now - lastValidationTime < VALIDATION_THROTTLE_MS) {
    console.log('Validation throttled, skipping...');
    return true; // Assume valid if we just checked recently
  }
  lastValidationTime = now;

  const token = getJWTToken();

  console.log('Validating session...');

  if (!token) {
    console.log('No token found, logging out...');
    if (timeoutId) clearTimeout(timeoutId);
    clearUserActivityTracking(activityEvents);
    timeoutGlobelAction();
    return false;
  }

  let data_decoded: any = jwtDecode(token);

  const sessionStartTime = new Date(data_decoded.iat * 1000);
  const sessionEndTime = new Date(data_decoded.exp * 1000);
  const lastActivityTime = new Date();

  const timeDifference =
    lastActivityTime.getTime() - sessionStartTime.getTime();
  const sessionTimeDifference =
    sessionEndTime.getTime() - sessionStartTime.getTime();

  const idealTime =
    (sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60);

  const timeDifferenceMinute = Math.floor(timeDifference / (1000 * 60));
  const sessionTimeDifferenceMinute = Math.floor(
    sessionTimeDifference / (1000 * 60)
  );

  if (timeDifferenceMinute > sessionTimeDifferenceMinute - 1) {
    console.log('Session expired, logging out...');
    if (timeoutId) clearTimeout(timeoutId);
    clearUserActivityTracking(activityEvents);
    timeoutGlobelAction();
    return false;
  }

  console.log(
    `Time elapsed: ${timeDifferenceMinute}min, Ideal refresh time: ${idealTime / 2}min`
  );

  if (timeDifferenceMinute > idealTime / 2) {
    try {
      const refreshSuccess = await extendToken();
      
      if (refreshSuccess) {
        // CRITICAL: After refresh, get the NEW token and decode it again
        const newToken = getJWTToken();
        if (newToken) {
          data_decoded = jwtDecode(newToken);
          console.log('Token refreshed, new iat:', new Date(data_decoded.iat * 1000));
          
          // Reset the validation time to allow immediate next validation if needed
          lastValidationTime = Date.now();
        }
      }
      
      return refreshSuccess;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  return true;
};

// Throttle function to limit execution rate
const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

export const resetSessionTimeout = (
  timeoutDuration: number,
  timeoutAction: () => void
) => {
  console.log('l2');

  const activityEvents = [
    'mousemove',
    'click',
    'keydown',
    'scroll',
    'touchstart',
  ];
  const token = getJWTToken();

  if (!token) {
    if (timeoutId) clearTimeout(timeoutId);
    clearUserActivityTracking(activityEvents);
    timeoutAction();
    console.log('hope not');
    return;
  }

  timeoutGlobelAction = timeoutAction;
  startSessionTimeout(timeoutDuration, timeoutAction, activityEvents);
  
  // Don't call validateSession on every activity event
  // It will be called via the throttled handler only when needed
};

export const trackUserActivity = (
  activityEvents: string[],
  timeoutDuration: number,
  timeoutAction: () => void
) => {
  // Create a throttled version that limits how often we reset and validate
  const throttledReset = throttle(() => {
    resetSessionTimeout(timeoutDuration, timeoutAction);
    validateSession(); // Only validate after throttle delay
  }, VALIDATION_THROTTLE_MS);

  handleUserActivity = () => {
    // Always reset the timeout on activity (for logout timer)
    if (timeoutId) clearTimeout(timeoutId);
    startSessionTimeout(timeoutDuration, timeoutAction, activityEvents);
    
    // But only validate occasionally (throttled)
    throttledReset();
  };

  activityEvents.forEach((event) => {
    window.addEventListener(event, handleUserActivity!);
  });

  console.log('l1');

  // Initial validation
  resetSessionTimeout(timeoutDuration, timeoutAction);
  validateSession();
};

export const clearUserActivityTracking = (activityEvents: string[]) => {
  activityEvents.forEach((event) => {
    if (handleUserActivity) {
      window.removeEventListener(event, handleUserActivity);
    }
  });

  if (timeoutId) clearTimeout(timeoutId);
  // Reset the throttle timer
  lastValidationTime = 0;
};