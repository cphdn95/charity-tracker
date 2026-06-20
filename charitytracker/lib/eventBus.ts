import { EventEmitter } from "events";

// Singleton EventEmitter that persists across Next.js hot reloads in dev and
// is shared by every request in the same server process. Donation POSTs emit
// on it; the SSE route listens and fans updates out to all connected clients.
const g = global as unknown as { _donationEventBus?: EventEmitter };
if (!g._donationEventBus) {
  g._donationEventBus = new EventEmitter();
  g._donationEventBus.setMaxListeners(200);
}

export const eventBus = g._donationEventBus;
