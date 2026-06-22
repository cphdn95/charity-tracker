import { Charity } from "./types";

// The charities people can pledge donations to.
// The `id` values are stored on each donation, so don't change them once live —
// rename freely by editing `name`, `blurb`, `url`, and `accent`.
export const CHARITIES: Charity[] = [
  {
    id: "charity-one",
    name: "Inclusive Navigators",
    blurb:
      "A nonprofit organization focusing on making the world more accessible and neurodivergent people more seen.",
    url: "https://inclusivenavigators.com/",
    accent: "emerald",
  },
  {
    id: "charity-two",
    name: "Battle Osteosarcoma",
    blurb:
      "A nonprofit organization recognizing the desperate need for osteosarcoma (bone cancer) research.",
    url: "https://www.battleosteosarcoma.org/",
    accent: "rose",
  },
  {
    id: "charity-three",
    name: "Camp Via West",
    blurb:
      "A nonprofit camp focusing on allowing people of all abilities to live their fullest and most joyful lives.",
    url: "https://campviawest.org/",
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
