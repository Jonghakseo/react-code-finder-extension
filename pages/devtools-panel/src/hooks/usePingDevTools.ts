import { useEffect, useState } from 'react';
import { devToolsStorage } from '@chrome-extension-boilerplate/shared';

export default function usePingDevTools() {
  const [trigger, setTrigger] = useState(0);

  /**
   * We can't distinguish whether the devTools is open or not.
   * So we ping every 1s to keep the devTools open status.
   */
  useEffect(() => {
    devToolsStorage.open();
    setTimeout(() => {
      setTrigger(prev => prev + 1);
    }, 1000);
  }, [trigger]);
}
