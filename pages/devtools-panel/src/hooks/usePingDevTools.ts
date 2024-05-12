import { useEffect, useState } from 'react';
import { devToolsStorage } from '@chrome-extension-boilerplate/shared';

export default function usePingDevTools() {
  const [trigger, setTrigger] = useState(0);

  /**
   * We can't distinguish whether the devTools is open or not.
   * So we ping every 300ms to keep the devTools open status.
   */
  useEffect(() => {
    setTimeout(() => {
      devToolsStorage.open();
      setTrigger(prev => prev + 1);
    }, 300);
  }, [trigger]);
}
