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
    id: "bay-area-rescue",
    name: "Bay Area Rescue Mission",
    blurb:
      "A nonprofit organization that offers help and healing to the homeless in the Bay Area by providing adequate needs like meals and shelter.",
    url: "https://www.bayarearescue.org/",
    accent: "blue",
  },
  {
    id: "autism-society-sf",
    name: "Autism Society San Francisco",
    blurb:
      "A nonprofit organization that focuses on community outreach, policy advocacy, educational networking, and expanding lifelong care options for autistic adults.",
    url: "https://sfautismsociety.org/",
    accent: "purple",
  },
];

export function getCharity(id: string): Charity | undefined {
  return CHARITIES.find((c) => c.id === id);
}
