import { useEffect, useId, useRef } from 'react';

type Handler = {
  id: string;
  closeFn: () => void;
};

const stack: Handler[] = [];
let isListenerRegistered = false;

const handleGlobalBack = (e: Event) => {
  if (stack.length > 0) {
    // Get the top-most handler
    const topHandler = stack[stack.length - 1];
    topHandler.closeFn();
    e.preventDefault();
  }
};

/**
 * Hook to handle hardware back button presses in Capacitor apps.
 * Triggers the close function and prevents the default back navigation 
 * if the modal/wizard is currently open. Only the top-most visible layer
 * will be closed on a single press.
 */
export function useHardwareBack(isOpen: boolean, closeFn: () => void) {
  const id = useId();
  const closeFnRef = useRef(closeFn);

  // Keep the ref fresh without re-triggering the stack push
  useEffect(() => {
    closeFnRef.current = closeFn;
  }, [closeFn]);

  useEffect(() => {
    if (!isListenerRegistered) {
      window.addEventListener('hardwareBackPress', handleGlobalBack);
      isListenerRegistered = true;
    }

    if (isOpen) {
      // Add to top of stack
      stack.push({ id, closeFn: () => closeFnRef.current() });
    } else {
      // Ensure it's removed if closed externally
      const index = stack.findIndex(h => h.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    }

    // Cleanup on unmount or when isOpen changes
    return () => {
      const index = stack.findIndex(h => h.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    };
  }, [isOpen, id]);
}
