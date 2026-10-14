"use client";

import { useSyncExternalStore } from "react";
import Shortcuts from "../../home/components/Shortcuts";
import { detectPlatform, type Platform } from "../../home/helper/homeHelper";

const subscribeNoop = () => () => {};

/** Shortcuts for the visitor's system; the server renders the Windows/Linux keys. */
export default function ShortcutsSection() {
  const platform = useSyncExternalStore<Platform>(subscribeNoop, detectPlatform, () => "other");
  return <Shortcuts platform={platform} />;
}
