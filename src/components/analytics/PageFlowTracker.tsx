"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_ID_KEY = "pf_session_id";
const LAST_PATH_KEY = "pf_last_path";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * Records the sequence of pages a visitor moves through in a single browser
 * session (first-party, no cookies, no PII — see Contact page's privacy
 * guarantee) so the admin analytics dashboard can show user flow and
 * drop-off points. Skips /admin routes: only visitor-facing navigation is
 * tracked, not the author's own usage of the CMS.
 */
export default function PageFlowTracker() {
  const pathname = usePathname();
  const lastSentPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastSentPath.current === pathname) return;
    lastSentPath.current = pathname;

    const sessionId = getSessionId();
    let referrerPath: string | null = null;
    try {
      referrerPath = sessionStorage.getItem(LAST_PATH_KEY);
    } catch {
      referrerPath = null;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path: pathname, referrerPath }),
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort; never surface a failure to the visitor.
    });

    try {
      sessionStorage.setItem(LAST_PATH_KEY, pathname);
    } catch {
      // Ignore (private browsing / storage disabled).
    }
  }, [pathname]);

  return null;
}
