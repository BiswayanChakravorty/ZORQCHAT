"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = supabaseBrowser();
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const recoveredEmail = userData.user?.email;

    if (!recoveredEmail) {
      setLoading(false);
      setError("Password changed, but we could not restore the session. Please log in again.");
      return;
    }

    await supabase.auth.signOut();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: recoveredEmail,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Password changed. Please log in again with your new password.");
      return;
    }

    setMessage("Password updated. You are ready to go.");
    setTimeout(() => router.push("/create"), 500);
  };

  return (
    <>
      <Header />
      <main className="container loginWrap">
        <div className="loginBox">
          <div className="eyebrow">ACCOUNT RECOVERY</div>
          <h1 style={{ fontFamily: "Space Grotesk", fontSize: 36, letterSpacing: -1.5 }}>
            Set a new password
          </h1>

          {ready ? (
            <form className="form" onSubmit={submit}>
              <input
                className="input"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
              />
              <button className="btn primary" disabled={loading}>
                {loading ? "Updating..." : "Update password →"}
              </button>
            </form>
          ) : (
            <p className="muted">Open the password recovery email to continue.</p>
          )}

          {error && <p className="error">{error}</p>}
          {message && <p className="muted">{message}</p>}
        </div>
      </main>
    </>
  );
}
