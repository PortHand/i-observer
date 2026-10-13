"use client";

import { useState } from "react";
import { homeContent } from "../content/homeContent";
import { formatTitle } from "../helper/homeHelper";

export const useHomeHandler = () => {
  const [title] = useState(formatTitle(homeContent.title));

  return { title };
};
