"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabaseBrowser } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signup, setSignup] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace("/explore");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) router.replace("/explore");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = supabaseBrowser();
    if (!supabase) {
      setError("Supabase is not configured yet.");
      setLoading(false);
      return;
    }

    if (signup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });

      if (error) {
        setError(error.message);
      } else {
        router.replace("/explore");
      }
    } else if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) setError(error.message);
      else setMessage("If that email has an account, a password reset link has been sent.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Incorrect email or password. Use ‘Forgot password?’ if you need email recovery.");
      } else {
        router.replace("/explore");
      }
    }

    setLoading(false);
  };

  const switchMode = (mode: "login" | "signup" | "forgot") => {
    setSignup(mode === "signup");
    setForgot(mode === "forgot");
    setError("");
    setMessage("");
  };

  return (
    <>
      <Header />
      <main className="container loginWrap">
        <div className="loginBox">
          <div className="eyebrow">
            {signup ? "JOIN ZORD" : forgot ? "ACCOUNT RECOVERY" : "WELCOME BACK"}
          </div>
          <h1 style={{ fontFamily: "Space Grotesk", fontSize: 36, letterSpacing: -1.5 }}>
            {signup ? "Create your ZORD profile" : forgot ? "Recover your account" : "Log in to ZORD"}
          </h1>

          <form className="form" onSubmit={submit}>
            {signup && (
              <input
                className="input"
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!forgot && (
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            )}

            <button className="btn primary" disabled={loading}>
              {loading ? "Please wait..." : signup ? "Create account →" : forgot ? "Send recovery email →" : "Log in →"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
          {message && <p className="muted">{message}</p>}

          {!signup && !forgot && (
            <button className="btn" style={{ width: "100%", marginTop: 12 }} onClick={() => switchMode("forgot")}>
              Forgot password?
            </button>
          )}

          <button
            className="btn"
            style={{ width: "100%", marginTop: 12 }}
            onClick={() => switchMode(signup || forgot ? "login" : "signup")}
          >
            {signup || forgot ? "Back to log in" : "New here? Create an account"}
          </button>
        </div>
      </main>
    </>
  );
}
