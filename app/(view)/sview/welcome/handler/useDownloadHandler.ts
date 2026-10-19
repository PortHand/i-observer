"use client";

import { useCallback, useEffect, useState } from "react";
import { download, type InstallerId } from "../content/welcomeContent";
import { detectInstaller } from "../helper/welcomeHelper";
import * as welcomeService from "../services/welcomeService";

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
 * The welcome page's download: works out the visitor's system, and on each click asks the server
 * for a fresh private link (it works for a minute) and starts the download with it straight away.
 * Links are never kept or shown, so there's nothing to copy and pass around.
 */
export const useDownloadHandler = () => {
  /** undefined while detecting; null when the system couldn't be told (e.g. a phone). */
  const [detected, setDetected] = useState<InstallerId | null | undefined>(undefined);
  /** The installer whose download was last started. */
  const [started, setStarted] = useState<InstallerId | null>(null);
  const [loading, setLoading] = useState<InstallerId | null>(null);
  const [error, setError] = useState("");

  const startInstaller = useCallback(async (installer: InstallerId) => {
    setLoading(installer);
    setError("");
    try {
      const result = await welcomeService.getDownloadLink(installer);
      if (!result.ok) return setError(result.error);
      startDownload(result.link.url);
      setStarted(installer);
    } catch {
      setError(download.error);
    } finally {
      setLoading(null);
    }
  }, []);

  // Detect the system once, to offer its installer first.
  useEffect(() => {
    let cancelled = false;
    detectInstaller().then((installer) => {
      if (!cancelled) setDetected(installer);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { detected, started, loading, error, startInstaller };
};
