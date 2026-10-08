import type { Contents, ModeId } from "@/lib/corridor";

export type TrackPhase = "done" | "now" | "next";

export type TrackEvent = {
  title: string;
  titleKu: string;
  place: string;
  placeKu: string;
  at: string;
  atKu: string;
  phase: TrackPhase;
};

export type Shipment = {
  id: string;
  fromId: string;
  toId: string;
  mode: ModeId;
  pieces: number;
  kg: number;
  l: number;
  w: number;
  h: number;
  contents: Contents;
  photo: boolean;
  hub: string;
  hubKu: string;
  events: TrackEvent[];
};

export const SHIPMENTS: Shipment[] = [
  {
    id: "RG-48291",
    fromId: "ber",
    toId: "ebl",
    mode: "express",
    pieces: 2,
    kg: 6.4,
    l: 50,
    w: 40,
    h: 30,
    contents: "personal",
    photo: true,
    hub: "Düsseldorf hub",
    hubKu: "کۆگای دوسلدۆرف",
    events: [
      { title: "Collected", titleKu: "کۆکرایەوە", place: "Berlin", placeKu: "بەرلین", at: "04 Oct · 09:40", atKu: "04 تشرینی یەکەم · 09:40", phase: "done" },
      { title: "Hub scan", titleKu: "سکانی کۆگا", place: "Düsseldorf", placeKu: "دوسلدۆرف", at: "04 Oct · 18:05", atKu: "04 تشرینی یەکەم · 18:05", phase: "done" },
      { title: "Departed by air", titleKu: "بە ئاسمان ڕۆیشت", place: "Frankfurt", placeKu: "فرانکفورت", at: "06 Oct · 01:10", atKu: "06 تشرینی یەکەم · 01:10", phase: "done" },
      { title: "Arrived at the gateway", titleKu: "گەیشتە دەروازە", place: "Erbil", placeKu: "هەولێر", at: "07 Oct · 23:40", atKu: "07 تشرینی یەکەم · 23:40", phase: "done" },
      { title: "Clearance released", titleKu: "گومرگ ئازاد کرا", place: "Erbil gateway", placeKu: "دەروازەی هەولێر", at: "08 Oct · 08:20", atKu: "08 تشرینی یەکەم · 08:20", phase: "done" },
      { title: "Out for delivery", titleKu: "دەرچووە بۆ گەیاندن", place: "Erbil", placeKu: "هەولێر", at: "08 Oct · 11:30", atKu: "08 تشرینی یەکەم · 11:30", phase: "now" },
      { title: "Delivered", titleKu: "گەیشت", place: "Erbil door", placeKu: "دەرگای هەولێر", at: "08 Oct", atKu: "08 تشرینی یەکەم", phase: "next" },
    ],
  },
  {
    id: "RG-22910",
    fromId: "sto",
    toId: "sul",
    mode: "economy",
    pieces: 1,
    kg: 8.1,
    l: 60,
    w: 40,
    h: 35,
    contents: "commercial",
    photo: true,
    hub: "Düsseldorf hub",
    hubKu: "کۆگای دوسلدۆرف",
    events: [
      { title: "Collected", titleKu: "کۆکرایەوە", place: "Stockholm", placeKu: "ستۆکهۆڵم", at: "02 Oct · 14:15", atKu: "02 تشرینی یەکەم · 14:15", phase: "done" },
      { title: "Hub scan", titleKu: "سکانی کۆگا", place: "Düsseldorf", placeKu: "دوسلدۆرف", at: "03 Oct · 11:00", atKu: "03 تشرینی یەکەم · 11:00", phase: "done" },
      { title: "Departed by air", titleKu: "بە ئاسمان ڕۆیشت", place: "Frankfurt", placeKu: "فرانکفورت", at: "05 Oct · 22:40", atKu: "05 تشرینی یەکەم · 22:40", phase: "done" },
      { title: "Arrived at the gateway", titleKu: "گەیشتە دەروازە", place: "Erbil", placeKu: "هەولێر", at: "07 Oct · 19:05", atKu: "07 تشرینی یەکەم · 19:05", phase: "done" },
      { title: "Clearance paused — invoice name does not match", titleKu: "گومرگ وەستا — ناوی پسوولە لەگەڵ وەرگر یەک ناگرێتەوە", place: "Erbil gateway", placeKu: "دەروازەی هەولێر", at: "08 Oct · 10:10", atKu: "08 تشرینی یەکەم · 10:10", phase: "now" },
      { title: "Transfer to Sulaymaniyah", titleKu: "گواستنەوە بۆ سلێمانی", place: "Erbil desk", placeKu: "مێزی هەولێر", at: "After release", atKu: "دوای ئازادکردن", phase: "next" },
      { title: "Door delivery", titleKu: "گەیاندن بۆ دەرگا", place: "Sulaymaniyah", placeKu: "سلێمانی", at: "Same day as transfer", atKu: "هەمان ڕۆژی گواستنەوە", phase: "next" },
    ],
  },
  {
    id: "RG-11084",
    fromId: "ams",
    toId: "dhk",
    mode: "road",
    pieces: 3,
    kg: 42,
    l: 80,
    w: 60,
    h: 50,
    contents: "commercial",
    photo: true,
    hub: "Düsseldorf hub",
    hubKu: "کۆگای دوسلدۆرف",
    events: [
      { title: "Collected", titleKu: "کۆکرایەوە", place: "Amsterdam", placeKu: "ئەمستردام", at: "24 Sep · 16:20", atKu: "24 ئەیلوول · 16:20", phase: "done" },
      { title: "Hub scan", titleKu: "سکانی کۆگا", place: "Düsseldorf", placeKu: "دوسلدۆرف", at: "25 Sep · 09:30", atKu: "25 ئەیلوول · 09:30", phase: "done" },
      { title: "Departed by road", titleKu: "بە وشکانی ڕۆیشت", place: "Düsseldorf", placeKu: "دوسلدۆرف", at: "27 Sep · 06:00", atKu: "27 ئەیلوول · 06:00", phase: "done" },
      { title: "At the border", titleKu: "لە سنوور", place: "Ibrahim Khalil", placeKu: "ئیبراهیم خەلیل", at: "08 Oct · 07:50", atKu: "08 تشرینی یەکەم · 07:50", phase: "now" },
      { title: "Erbil gateway", titleKu: "دەروازەی هەولێر", place: "Erbil", placeKu: "هەولێر", at: "After the border", atKu: "دوای سنوور", phase: "next" },
      { title: "Door delivery", titleKu: "گەیاندن بۆ دەرگا", place: "Duhok", placeKu: "دهۆک", at: "Next morning", atKu: "بەیانیی دواتر", phase: "next" },
    ],
  },
  {
    id: "RG-77302",
    fromId: "lon",
    toId: "bgw",
    mode: "express",
    pieces: 1,
    kg: 2.2,
    l: 35,
    w: 25,
    h: 12,
    contents: "documents",
    photo: true,
    hub: "London desk",
    hubKu: "مێزی لەندەن",
    events: [
      { title: "Collected", titleKu: "کۆکرایەوە", place: "London", placeKu: "لەندەن", at: "28 Sep · 11:05", atKu: "28 ئەیلوول · 11:05", phase: "done" },
      { title: "Hub scan", titleKu: "سکانی کۆگا", place: "London desk", placeKu: "مێزی لەندەن", at: "28 Sep · 15:40", atKu: "28 ئەیلوول · 15:40", phase: "done" },
      { title: "Departed by air", titleKu: "بە ئاسمان ڕۆیشت", place: "London", placeKu: "لەندەن", at: "30 Sep · 21:15", atKu: "30 ئەیلوول · 21:15", phase: "done" },
      { title: "Arrived at the gateway", titleKu: "گەیشتە دەروازە", place: "Erbil", placeKu: "هەولێر", at: "02 Oct · 18:25", atKu: "02 تشرینی یەکەم · 18:25", phase: "done" },
      { title: "Clearance released", titleKu: "گومرگ ئازاد کرا", place: "Erbil gateway", placeKu: "دەروازەی هەولێر", at: "02 Oct · 20:10", atKu: "02 تشرینی یەکەم · 20:10", phase: "done" },
      { title: "Transferred", titleKu: "گواسترایەوە", place: "Baghdad desk", placeKu: "مێزی بەغدا", at: "03 Oct · 09:00", atKu: "03 تشرینی یەکەم · 09:00", phase: "done" },
      { title: "Delivered", titleKu: "گەیشت", place: "Baghdad", placeKu: "بەغدا", at: "03 Oct · 16:05", atKu: "03 تشرینی یەکەم · 16:05", phase: "now" },
    ],
  },
];

export function findShipment(id: string) {
  const key = id.trim().toUpperCase();
  return SHIPMENTS.find((item) => item.id === key);
}

export function currentEvent(shipment: Shipment) {
  return shipment.events.find((event) => event.phase === "now") ?? shipment.events[shipment.events.length - 1];
}
