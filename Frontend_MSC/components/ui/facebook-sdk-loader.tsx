// components/FacebookSDKLoader.tsx
'use client';

import { useEffect } from 'react';

const FacebookSDKLoader = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only load if not already loaded
      if (window.FB) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      // Replace YOUR_APP_ID with actual Facebook App ID or remove if not using
      script.src = 'https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0';

      script.onerror = () => {
        console.warn('Facebook SDK failed to load');
      };

      if (!document.getElementById('facebook-jssdk')) {
        document.body.appendChild(script);
      }
    }
  }, []);

  return null;
};

export default FacebookSDKLoader;