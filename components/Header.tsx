"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setEmail(session?.user.email ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="nav">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Link href="/" className="brand">ZORD</Link>

        <nav className="navlinks">
          <Link href="/explore">Explore</Link>
          <Link href="/create">Create</Link>
          <Link href="/feed">Trending</Link>
        </nav>

        <div className="actions">
          {loading ? null : email ? (
            <>
              <Link className="btn secondary" href="/profile">Profile</Link>
              <button className="btn primary" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn secondary" href="/login">Log in</Link>
              <Link className="btn primary" href="/login">Join ZORD</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
