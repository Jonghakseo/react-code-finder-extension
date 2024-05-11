import { useEffect } from 'react';
import { devToolsStorage } from '@src/shared/storages/devToolsStorage';

export default function usePingDevTools() {
  /**
   * We can't distinguish whether the devTools is open or not.
   * So we ping every 300ms to keep the devTools open status.
   */
  useEffect(() => {
    const id = setInterval(() => devToolsStorage.open(), 300);
    return () => {
      clearInterval(id);
    };
  }, []);
}
