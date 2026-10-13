"use client";

import { useHomeHandler } from "./handler/useHomeHandler";

export default function HomeView() {
  const { title } = useHomeHandler();

  return <h1>{title}</h1>;
}
