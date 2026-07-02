import { useState, useEffect } from "react";
import api from "../services/api";

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // basic expiry check (exp is seconds since epoch)
    if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function useDashboardAuth(role, tokenKey, onLoadData) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(tokenKey);
    if (saved) {
      const payload = parseJwt(saved);
      if (!payload || payload.role !== role) {
        localStorage.removeItem(tokenKey);
        return;
      }
      setToken(saved);
      if (onLoadData) {
        // defer to next tick to avoid React state update warnings
        Promise.resolve().then(() => onLoadData(saved));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  async function login(e, onLoginSuccess) {
    if (e) {
      e.preventDefault();
    }
    setMsg("");
    setLoading(true);

    try {
      const data = await api.post("/auth/login", { email, password });
      const payload = parseJwt(data.token);

      if (!payload || payload.role !== role) {
        setMsg("Access denied");
        setLoading(false);
        return;
      }

      localStorage.setItem(tokenKey, data.token);
      setToken(data.token);
      setMsg("Login successful");
      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      }
      if (onLoadData) {
        onLoadData(data.token);
      }
    } catch (err) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // Robust logout: clear token and allow optional cleanup callback
  function logout(onLogoutClear) {
    localStorage.removeItem(tokenKey);
    setToken("");
    setMsg("Logged out successfully");
    if (onLogoutClear) onLogoutClear();
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    token,
    setToken,
    msg,
    setMsg,
    loading,
    login,
    logout
  };
}

export default useDashboardAuth;
