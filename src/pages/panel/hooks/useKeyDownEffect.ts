import { useEffect, useRef } from 'react';

export default function useKeyDownEffect(
  checkKey: (event: KeyboardEvent) => boolean,
  callback: () => unknown,
  deps: unknown[],
) {
  const checkKeyRef = useRef(checkKey);
  const callbackRef = useRef(callback);
  checkKeyRef.current = checkKey;
  callbackRef.current = callback;

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (checkKeyRef.current(e)) {
        e.preventDefault();
        callbackRef.current();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
}

export function withMeta(key: string) {
  return (e: KeyboardEvent): boolean => e.metaKey && e.key === key;
}
