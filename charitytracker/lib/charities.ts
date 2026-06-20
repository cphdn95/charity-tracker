import { Charity } from "./types";

// The three charities people can pledge donations to.
// These ids are stored on each donation, so don't change them once live.
export const CHARITIES: Charity[] = [
  {
    id: "charity-one",
    name: "Charity One",
    blurb: "Clean water for communities in need.",
    accent: "emerald",
  },
  {
    id: "charity-two",
    name: "Charity Two",
    blurb: "Books and supplies for local schools.",
    accent: "blue",
  },
  {
    id: "charity-three",
    name: "Charity Three",
    blurb: "Meals for families facing hunger.",
    accent: "purple",
  },
];

export function getCharity(id: string): Charity | undefined {
  return CHARITIES.find((c) => c.id === id);
}
