
/**
 * Detect if the application is running in a staging/test environment
 * based on the URL hostname
 */
export const isTestEnvironment = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
  // Check if the user has manually set test mode in localStorage
  if (getTestModeOverride() === true) return true;
  
  const hostname = window.location.hostname;
  
  // List of hostnames that are considered staging/test environments
  const testDomains = [
    'localhost',
    '127.0.0.1',
    'staging.yourdomain.com', // Replace with your actual staging domain
    'test.yourdomain.com',    // Replace with your actual test domain
    'preview.lovable.dev',    // Lovable preview domain
  ];
  
  return testDomains.some(domain => hostname.includes(domain));
};

/**
 * Check if test mode is manually enabled via localStorage
 */
export const getTestModeOverride = (): boolean | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null;
  
  const override = localStorage.getItem('stripeTestMode');
  return override === 'true' ? true : null;
};

/**
 * Set test mode override in localStorage
 */
export const setTestModeOverride = (enabled: boolean): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  if (enabled) {
    localStorage.setItem('stripeTestMode', 'true');
  } else {
    localStorage.removeItem('stripeTestMode');
  }
};

/**
 * Get the environment mode label
 */
export const getEnvironmentMode = (): 'test' | 'live' => {
  return isTestEnvironment() ? 'test' : 'live';
};

