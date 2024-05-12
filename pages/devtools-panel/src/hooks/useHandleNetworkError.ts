import { useState } from 'react';

type ArgumentsType<T> = T extends (...args: infer U) => unknown ? U : never;

export default function useHandleNetworkError() {
  const [networkError, setNetworkError] = useState<Error | null>(null);

  // eslint-disable-next-line @typescript-eslint/ban-types
  function withHandleNetworkError<Fn extends Function>(fn: Fn) {
    return async (...args: ArgumentsType<Fn>) => {
      try {
        await fn(...args);
        setNetworkError(null);
      } catch (e) {
        if (e instanceof Error) {
          setNetworkError(e);
        }
      }
    };
  }

  return { withHandleNetworkError, networkError };
}
