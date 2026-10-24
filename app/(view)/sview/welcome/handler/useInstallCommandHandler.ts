"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { installCommand } from "../content/welcomeContent";
import * as welcomeService from "../services/welcomeService";
import type { InstallCommands } from "../services/welcomeService";

/**
 * The Terminal install commands: made on request (not on page load, so a token is only created when
 * someone means to install), then marked expired once their token's time is up. Both tabs share one
 * set; making a new one cancels the last.
 */
export const useInstallCommandHandler = () => {
  const [commands, setCommands] = useState<InstallCommands | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await welcomeService.getInstallCommands();
      if (!result.ok) return setError(result.error);
      setCommands(result.commands);
      setExpired(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setExpired(true), result.commands.expiresIn * 1000);
    } catch {
      setError(installCommand.error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { commands, expired, loading, error, generate };
};
