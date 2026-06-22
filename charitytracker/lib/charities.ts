import { Charity } from "./types";

// The charities people can pledge donations to.
// The `id` values are stored on each donation, so don't change them once live —
// rename freely by editing `name`, `blurb`, and `accent`.
export const CHARITIES: Charity[] = [
  {
    id: "charity-one",
    name: "Inclusive Navigators",
    blurb: "Making the world a better place for people with disabilities.",
    accent: "emerald",
  },
  {
    id: "charity-two",
    name: "Battle Osteosarcoma",
    blurb: "Fighting osteosarcoma — bone cancer — and supporting patients and families.",
    accent: "rose",
  },
  {
    id: "charity-three",
    name: "Camp Via West",
    blurb: "A camp in Santa Clara for kids with disabilities.",
    accent: "blue",
  },
  {
    id: "charity-four",
    name: "Charity X",
    blurb: "To be announced.",
    accent: "amber",
  },
  {
    id: "charity-five",
    name: "Charity Y",
    blurb: "To be announced.",
    accent: "purple",
  },
  {
    id: "charity-six",
    name: "Charity Z",
    blurb: "To be announced.",
    accent: "cyan",
  },
];

export function getCharity(id: string): Charity | undefined {
  return CHARITIES.find((c) => c.id === id);
}
