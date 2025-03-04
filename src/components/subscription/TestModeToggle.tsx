
import React, { useState, useEffect } from 'react';
import { getTestModeOverride, setTestModeOverride, getEnvironmentMode } from '@/utils/environment';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export const TestModeToggle = () => {
  const [testMode, setTestMode] = useState<boolean>(false);
  
  useEffect(() => {
    const override = getTestModeOverride();
    setTestMode(override === true);
  }, []);
  
  const toggleTestMode = (enabled: boolean) => {
    setTestMode(enabled);
    setTestModeOverride(enabled);
    
    if (enabled) {
      toast.info('Stripe test mode enabled. All payment operations will use Stripe test API keys.');
    } else {
      toast.info('Stripe test mode disabled. Payment operations will use the appropriate mode based on environment.');
    }
    
    // Give the user time to see the notification before reloading
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const currentMode = getEnvironmentMode();
  
  return (
    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Stripe Test Mode</h3>
          <p className="mt-1 text-sm text-amber-700">
            Toggle test mode to test payments without using real money.
            Current mode: <span className="font-medium">{currentMode.toUpperCase()}</span>
          </p>
          <div className="mt-3 flex items-center space-x-3">
            <Switch 
              id="test-mode" 
              checked={testMode} 
              onCheckedChange={toggleTestMode} 
            />
            <label htmlFor="test-mode" className="text-sm font-medium text-amber-800 cursor-pointer">
              {testMode ? 'Test mode enabled' : 'Test mode disabled'}
            </label>
          </div>
          
          <div className="mt-2 text-xs text-amber-600">
            {testMode ? (
              <span>
                Using Stripe test mode. Use test card number: 4242 4242 4242 4242, any future expiration date, any 3-digit CVC, and any ZIP code.
              </span>
            ) : (
              <span>
                Using Stripe {currentMode} mode based on your environment.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
