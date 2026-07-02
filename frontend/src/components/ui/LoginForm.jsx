import { memo } from "react";

/**
 * LoginForm — shared login form for authenticated dashboards.
 *
 * Eliminates identical login JSX copy-pasted in HostDashboard,
 * SecurityDashboard, and AdminDashboard (~60 lines total).
 *
 * Accessibility improvements over the original:
 * - Proper <label htmlFor> pairing for all inputs
 * - role="alert" on error message
 * - aria-describedby linking error to the form
 * - Keyboard submit works natively via type="submit"
 *
 * @param {{
 *   title?: string,
 *   email: string,
 *   setEmail: (v: string) => void,
 *   password: string,
 *   setPassword: (v: string) => void,
 *   onSubmit: (e: Event) => void,
 *   loading?: boolean,
 *   msg?: string,
 *   formId?: string,
 * }} props
 */
function LoginForm({
  title,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading = false,
  msg = "",
  formId = "login-form",
}) {
  const emailId    = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const msgId      = `${formId}-msg`;

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="loginBox"
      aria-label={title || "Login"}
      aria-describedby={msg ? msgId : undefined}
      noValidate
    >
      {title && <h2>{title}</h2>}

      <label htmlFor={emailId}>Email address</label>
      <input
        id={emailId}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        aria-required="true"
      />

      <label htmlFor={passwordId}>Password</label>
      <input
        id={passwordId}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        aria-required="true"
      />

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Logging in…" : "Login"}
      </button>

      {msg && (
        <p
          id={msgId}
          role="alert"
          aria-live="assertive"
          style={{ margin: 0 }}
        >
          {msg}
        </p>
      )}
    </form>
  );
}

export default memo(LoginForm);
