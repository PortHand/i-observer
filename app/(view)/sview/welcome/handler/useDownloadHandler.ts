"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { download, type InstallerId } from "../content/welcomeContent";
import { detectInstaller, isAvailableInstaller } from "../helper/welcomeHelper";
import * as welcomeService from "../services/welcomeService";

/** Stop offering a link a little before the server says it expires, so a click never lands on a dead one. */
const EXPIRY_MARGIN_MS = 5000;

export interface ActiveLink extends welcomeService.DownloadLink {
  /** When the link stops being offered, by this browser's clock. */
  deadline: number;
}

/** Hands the browser a link that answers with "Content-Disposition: attachment": it saves the file and stays on the page. */
const startDownload = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

/**
 * The welcome page's download: works out the visitor's system, fetches a short-lived link for it
 * and starts the download straight away (when `allowed`). Other installers and fresh links on demand.
 */
export const useDownloadHandler = (allowed: boolean) => {
  /** undefined while detecting; null when the system couldn't be told (e.g. a phone). */
  const [detected, setDetected] = useState<InstallerId | null | undefined>(undefined);
  const [link, setLink] = useState<ActiveLink | null>(null);
  const [loading, setLoading] = useState<InstallerId | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const autoStarted = useRef(false);

  const requestLink = useCallback(async (installer: InstallerId) => {
    setLoading(installer);
    setError("");
    try {
      const result = await welcomeService.getDownloadLink(installer);
      if (!result.ok) return setError(result.error);
      const received = Date.now();
      setLink({ ...result.link, deadline: received + result.link.expiresIn * 1000 - EXPIRY_MARGIN_MS });
      setNow(received);
      startDownload(result.link.url);
    } catch {
      setError(download.error);
    } finally {
      setLoading(null);
    }
  }, []);

  // Detect the system once, and start its download on arrival.
  useEffect(() => {
    let cancelled = false;
    detectInstaller().then((installer) => {
      if (cancelled) return;
      setDetected(installer);
      // Windows and Linux are coming soon: nothing to start for them.
      if (allowed && installer && isAvailableInstaller(installer) && !autoStarted.current) {
        autoStarted.current = true;
        void requestLink(installer);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [allowed, requestLink]);

  // Tick the countdown while a link is live.
  const live = link !== null && now < link.deadline;
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [live]);

  return {
    detected,
    link,
    live,
    secondsLeft: link ? (link.deadline - now) / 1000 : 0,
    loading,
    error,
    requestLink,
  };
};
