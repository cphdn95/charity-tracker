import { Charity } from "./types";
import { getCharity } from "./charities";

export type Accent = Charity["accent"];

export interface AccentClasses {
  dot: string;
  text: string;
  bar: string;
  ring: string;
  selected: string;
  button: string;
}

// One source of truth for every charity color. All class names are written out
// literally here so Tailwind includes them in the build.
export const ACCENT_CLASSES: Record<Accent, AccentClasses> = {
  emerald: {
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
    ring: "hover:border-emerald-500",
    selected: "border-emerald-500 bg-emerald-500/10",
    button: "bg-emerald-600 hover:bg-emerald-500",
  },
  blue: {
    dot: "bg-blue-500",
    text: "text-blue-400",
    bar: "bg-blue-500",
    ring: "hover:border-blue-500",
    selected: "border-blue-500 bg-blue-500/10",
    button: "bg-blue-600 hover:bg-blue-500",
  },
  purple: {
    dot: "bg-purple-500",
    text: "text-purple-400",
    bar: "bg-purple-500",
    ring: "hover:border-purple-500",
    selected: "border-purple-500 bg-purple-500/10",
    button: "bg-purple-600 hover:bg-purple-500",
  },
  amber: {
    dot: "bg-amber-500",
    text: "text-amber-400",
    bar: "bg-amber-500",
    ring: "hover:border-amber-500",
    selected: "border-amber-500 bg-amber-500/10",
    button: "bg-amber-600 hover:bg-amber-500",
  },
  rose: {
    dot: "bg-rose-500",
    text: "text-rose-400",
    bar: "bg-rose-500",
    ring: "hover:border-rose-500",
    selected: "border-rose-500 bg-rose-500/10",
    button: "bg-rose-600 hover:bg-rose-500",
  },
  cyan: {
    dot: "bg-cyan-500",
    text: "text-cyan-400",
    bar: "bg-cyan-500",
    ring: "hover:border-cyan-500",
    selected: "border-cyan-500 bg-cyan-500/10",
    button: "bg-cyan-600 hover:bg-cyan-500",
  },
};

// Gray fallback for a donation whose charity no longer exists.
const FALLBACK: AccentClasses = {
  dot: "bg-gray-500",
  text: "text-gray-300",
  bar: "bg-gray-500",
  ring: "hover:border-gray-500",
  selected: "border-gray-500 bg-gray-500/10",
  button: "bg-gray-600 hover:bg-gray-500",
};

// Look up the color classes for a charity by its id (used for donations,
// which only carry the id).
export function classesForCharity(charityId: string): AccentClasses {
  const charity = getCharity(charityId);
  return charity ? ACCENT_CLASSES[charity.accent] : FALLBACK;
}
