import { eventBus } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Server-Sent Events stream. Every connected browser (phone or laptop) holds
// one open connection here; when a donation is recorded the donations route
// emits "donation_update" and we forward it to all of them in real time.
export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Client already disconnected.
        }
      };

      // Let the client know it's connected.
      send({ type: "connected" });

      const onDonationUpdate = (payload: unknown) => {
        send({ type: "donation_update", payload });
      };

      eventBus.on("donation_update", onDonationUpdate);

      // Keep-alive ping every 25s so proxies don't close an idle connection.
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);

      cleanup = () => {
        eventBus.off("donation_update", onDonationUpdate);
        clearInterval(keepAlive);
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
