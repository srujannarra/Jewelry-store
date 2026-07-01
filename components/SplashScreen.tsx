"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MIN_SPLASH_MS = 1000;
const MAX_SPLASH_MS = 3000;
const FADE_OUT_MS = 600;
const LOAD_WARNING_MS = 8000;
const SESSION_KEY = "svj_splash_shown";

export default function SplashScreen() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [loadIssue, setLoadIssue] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setVisible(false);
    setIsExiting(false);
    setLoadIssue(null);

    if (pathname !== "/") return;

    let shouldShow = true;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
          shouldShow = false;
        }
      }
    } catch {
      // Privacy mode / blocked storage — still show splash but won't persist.
    }

    let pageLoaded = document.readyState === "complete";
    let minTimeElapsed = false;
    let exitTriggered = false;
    let removeTimer: number | undefined;
    let warningTimer: number | undefined;
    let issueListenersActive = false;

    const markSplashShown = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Ignore — storage may be blocked.
      }
    };

    const triggerExit = () => {
      if (exitTriggered) return;
      if (!(pageLoaded && minTimeElapsed)) return;
      exitTriggered = true;
      markSplashShown();
      setIsExiting(true);
      removeTimer = window.setTimeout(() => setVisible(false), FADE_OUT_MS);
    };

    const onPageLoad = () => {
      pageLoaded = true;
      if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      removeIssueListeners();
      triggerExit();
    };

    const removeIssueListeners = () => {
      if (!issueListenersActive) return;
      window.removeEventListener("error", onLoadError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      issueListenersActive = false;
    };

    const onLoadError = (event: ErrorEvent) => {
      const message =
        event.message ||
        "Something went wrong while loading the page. Please refresh and try again.";
      setLoadIssue(message);
    };

    const onUnhandledRejection = () => {
      setLoadIssue(
        "The page could not finish loading because a background request failed. Please check your connection and refresh."
      );
    };

    if (!pageLoaded) {
      window.addEventListener("load", onPageLoad);
      window.addEventListener("error", onLoadError);
      window.addEventListener("unhandledrejection", onUnhandledRejection);
      issueListenersActive = true;

      warningTimer = window.setTimeout(() => {
        if (document.readyState !== "complete") {
          setLoadIssue(
            "The home page is taking longer than expected to load. Please check your internet connection and refresh."
          );
        }
      }, LOAD_WARNING_MS);
    }

    if (!shouldShow) {
      return () => {
        window.removeEventListener("load", onPageLoad);
        removeIssueListeners();
        if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      };
    }

    setVisible(true);

    const minTimer = window.setTimeout(() => {
      minTimeElapsed = true;
      triggerExit();
    }, MIN_SPLASH_MS);

    const maxTimer = window.setTimeout(() => {
      pageLoaded = true;
      minTimeElapsed = true;
      triggerExit();
    }, MAX_SPLASH_MS);

    return () => {
      window.removeEventListener("load", onPageLoad);
      removeIssueListeners();
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!mounted || (!visible && !loadIssue)) return null;

  return (
    <>
      {visible && (
        <div
          className={`splash-overlay ${isExiting ? "splash-overlay--exit" : ""}`}
          role="presentation"
          aria-hidden="true"
        >
          <div className="splash-particles" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`splash-particle splash-particle-${i + 1}`}
              />
            ))}
          </div>

          <div className="splash-logo-wrapper">
            <Image
              src="/logo.png"
              alt="Shri Vasavi Jewellers"
              width={500}
              height={500}
              priority
              className="splash-logo"
            />
            <div className="splash-shimmer-mask" aria-hidden="true">
              <div className="splash-shimmer" />
            </div>
          </div>
        </div>
      )}

      {loadIssue && (
        <div className="splash-error-backdrop" role="presentation">
          <div
            className="splash-error-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="splash-error-title"
          >
            <h2 id="splash-error-title">Page loading issue</h2>
            <p>{loadIssue}</p>
            <div className="splash-error-actions">
              <button type="button" onClick={() => window.location.reload()}>
                Refresh page
              </button>
              <button type="button" onClick={() => setLoadIssue(null)}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
