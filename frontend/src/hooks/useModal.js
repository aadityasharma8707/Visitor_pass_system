import { useState, useCallback } from "react";

/**
 * useModal — simple open/close/toggle state for modals, drawers, and dialogs.
 *
 * Decision: `showDrawer` / `setShowDrawer` appeared identically in both
 * HostDashboard and SecurityDashboard. Extracting to a named hook makes
 * intent clear and removes the boolean-state boilerplate.
 *
 * @param {boolean} [initialState=false]
 * @returns {{ isOpen: boolean, open: Function, close: Function, toggle: Function }}
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open   = useCallback(() => setIsOpen(true),  []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

export default useModal;
