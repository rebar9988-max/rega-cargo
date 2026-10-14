export type TrackingEventRow = {
  title: string;
  title_ku: string;
  place: string;
  place_ku: string;
  phase: string;
  created_at: string | Date;
  occurred_at: string | Date | null;
  next_action: string;
  estimate_from: string | Date | null;
  estimate_to: string | Date | null;
};
export function trackingEvent(row: TrackingEventRow) {
  const iso = (value: string | Date | null) =>
    value == null ? null : new Date(value).toISOString();
  return {
    title: row.title,
    titleKu: row.title_ku,
    place: row.place,
    placeKu: row.place_ku,
    phase: row.phase,
    at: row.phase === "next" ? null : iso(row.occurred_at),
    recordedAt: iso(row.created_at),
    nextAction: row.next_action,
    estimateFrom: iso(row.estimate_from),
    estimateTo: iso(row.estimate_to),
  };
}
export function trackingAction(status: string, recorded: string) {
  if (["invoice", "contact", "delivery"].includes(recorded)) return recorded;
  if (status === "quoted") return "quote";
  if (status === "delivered") return "done";
  if (status === "cancelled") return "contact";
  return "wait";
}
