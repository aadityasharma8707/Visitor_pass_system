import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  function pushToast(text, type = "success") {
    const id = Date.now();
    setToasts((t) => [...t, { id, text, type }]);
    setNotifications((n) => [{ id, text, type, time: new Date() }, ...n]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  }

  return {
    toasts,
    setToasts,
    notifications,
    setNotifications,
    pushToast
  };
}

export default useToast;
