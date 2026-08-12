"use client";

import { useReveal } from "./Reveal";

/** Просто монтирует useReveal один раз на странице. */
export function HomeReveal() {
  useReveal();
  return null;
}
