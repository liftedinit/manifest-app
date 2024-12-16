import { useState, useEffect } from 'react';
declare global {
  interface Navigator {
    userAgentData?: {
      mobile: boolean;
    };
  }
}
export const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      if (navigator.userAgentData) {
        setIsMobile(navigator.userAgentData.mobile);
      } else {
        setIsMobile(
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
      }
    };

    checkDevice();
  }, []);

  return { isMobile };
};
