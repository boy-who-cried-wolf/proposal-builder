
/**
 * Detect if the application is running in a staging/test environment
 * based on the URL hostname
 */
export const isTestEnvironment = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
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
 * Get the environment mode label
 */
export const getEnvironmentMode = (): 'test' | 'live' => {
  return isTestEnvironment() ? 'test' : 'live';
};

/**
 * Validate application routes to ensure they exist
 */
export const getValidRoutes = (): string[] => {
  return [
    '/',                // Home
    '/dashboard',       // Dashboard
    '/assistant',       // Assistant
    '/admin',           // Admin (requires admin permission)
    '/settings',        // Settings
    '/account-settings' // Legacy settings route
  ];
};
