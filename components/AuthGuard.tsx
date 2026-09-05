"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/login" || pathname === "/reset-password") return;

    const supabase = supabaseBrowser();
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;

      const lastSignIn = data.session.user.last_sign_in_at;
      if (!lastSignIn) return;

      if (Date.now() - new Date(lastSignIn).getTime() >= THIRTY_DAYS) {
        await supabase.auth.signOut();
        if (active) router.replace("/login?reauth=1");
      }
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  return null;
}
