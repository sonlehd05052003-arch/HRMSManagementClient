import { useEffect, type ReactNode } from "react";
import { Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchCurrentUser, selectSessionChecked } from "../store/authSlide";

// Builds before the cookie switch kept the session (and the JWT) in localStorage under this key
const LEGACY_SESSION_KEY = "persist:auth";

/**
 * Asks the API who is signed in (from the HttpOnly cookie) before rendering the app, so route guards
 * see the real session instead of redirecting to the login page on every reload.
 */
const SessionGate = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const sessionChecked = useAppSelector(selectSessionChecked);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      // Storage may be blocked; there is nothing to clean up then
    }
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!sessionChecked) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionGate;
