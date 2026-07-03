const LOCAL_TOKEN_KEY = 'auth-token';
const SESSION_TOKEN_KEY = 'auth-token-session';
const LOCAL_REFRESH_KEY = 'auth-refresh-token';
const SESSION_REFRESH_KEY = 'auth-refresh-token-session';
const REMEMBER_KEY = 'auth-remember-me';

const hasWindow = () => typeof window !== 'undefined';

const safeGetStorage = (type) => {
  if (!hasWindow()) {
    return null;
  }

  try {
    return window[type];
  } catch {
    return null;
  }
};

const local = () => safeGetStorage('localStorage');
const session = () => safeGetStorage('sessionStorage');

const readToken = (storage, key) => {
  try {
    return storage?.getItem(key) || '';
  } catch {
    return '';
  }
};

const writeToken = (storage, key, value) => {
  try {
    if (!storage) {
      return;
    }

    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  } catch {
    // Ignore storage failures in private browsing / restricted environments.
  }
};

export const getStoredAuthToken = () => readToken(session(), SESSION_TOKEN_KEY) || readToken(local(), LOCAL_TOKEN_KEY);

export const getStoredRefreshToken = () => readToken(session(), SESSION_REFRESH_KEY) || readToken(local(), LOCAL_REFRESH_KEY);

export const getStoredRememberMe = () => {
  const sessionValue = readToken(session(), REMEMBER_KEY);
  const localValue = readToken(local(), REMEMBER_KEY);

  if (sessionValue) {
    return sessionValue === 'true';
  }

  if (localValue) {
    return localValue === 'true';
  }

  return false;
};

export const setStoredAuthToken = (token, rememberMe = false, refreshToken = '') => {
  const localStorageRef = local();
  const sessionStorageRef = session();

  writeToken(localStorageRef, LOCAL_TOKEN_KEY, '');
  writeToken(sessionStorageRef, SESSION_TOKEN_KEY, '');
  writeToken(localStorageRef, LOCAL_REFRESH_KEY, '');
  writeToken(sessionStorageRef, SESSION_REFRESH_KEY, '');
  writeToken(localStorageRef, REMEMBER_KEY, '');
  writeToken(sessionStorageRef, REMEMBER_KEY, '');

  if (!token) {
    return;
  }

  if (rememberMe) {
    writeToken(localStorageRef, LOCAL_TOKEN_KEY, token);
    writeToken(localStorageRef, LOCAL_REFRESH_KEY, refreshToken);
    writeToken(localStorageRef, REMEMBER_KEY, 'true');
  } else {
    writeToken(sessionStorageRef, SESSION_TOKEN_KEY, token);
    writeToken(sessionStorageRef, SESSION_REFRESH_KEY, refreshToken);
    writeToken(sessionStorageRef, REMEMBER_KEY, 'false');
  }
};

export const clearStoredAuthToken = () => {
  writeToken(local(), LOCAL_TOKEN_KEY, '');
  writeToken(local(), LOCAL_REFRESH_KEY, '');
  writeToken(local(), REMEMBER_KEY, '');
  writeToken(session(), SESSION_TOKEN_KEY, '');
  writeToken(session(), SESSION_REFRESH_KEY, '');
  writeToken(session(), REMEMBER_KEY, '');
};

export const rememberMeStorageMode = () => (getStoredRememberMe() ? 'local' : 'session');
