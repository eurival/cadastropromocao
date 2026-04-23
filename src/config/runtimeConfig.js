const runtimeConfig = typeof window !== 'undefined' ? window.runtimeConfig ?? {} : {};

function getViteValue(key) {
  return import.meta.env[key] ?? '';
}

export function getApiBaseUrl() {
  return getViteValue('VITE_API_BASE_URL') || runtimeConfig.API_BASE_URL || '';
}

export function getApiUsername() {
  return getViteValue('VITE_API_USERNAME') || runtimeConfig.API_USERNAME || '';
}

export function getApiPassword() {
  return getViteValue('VITE_API_PASSWORD') || runtimeConfig.API_PASSWORD || '';
}
