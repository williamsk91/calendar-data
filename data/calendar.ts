import { differenceInHours } from "date-fns";

import { Tag } from "../component/Tag";

type GEvent = gapi.client.calendar.Event;

// ------------------------- API -------------------------

export const getCalendarLists = async () => {
  const res = await gapi.client.calendar.calendarList.list();
  console.log("res: ", res);
  return res;
};

export const getRangeEvents = async (
  from: Date,
  to: Date
): Promise<GEvent[]> => {
  const res = await gapi.client.calendar.events.list({
    calendarId: "williamsKusnandi@gmail.com",
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
    q: "#",
  });

  return res.result.items;
};

const GOOLGE_CALENDAR_COLORS: Record<string, string> = {
  "0": "#039be5",
  "1": "#7986cb",
  "2": "#33b679",
  "3": "#8e24aa",
  "4": "#e67c73",
  "5": "#f6c026",
  "6": "#f5511d",
  "7": "#039be5",
  "8": "#616161",
  "9": "#3f51b5",
  "10": "#0b8043",
  "11": "#d60000",
};

const colorIdToColor = (googleColorId: string): string =>
  GOOLGE_CALENDAR_COLORS[googleColorId] || GOOLGE_CALENDAR_COLORS["0"];

// ------------------------- Tag -------------------------

const extractTag = (event: GEvent): Tag | undefined => {
  const tagRegex = /^#([\w-]{0,16})/;
  const tagCandidate = event.description?.match(tagRegex);

  if (!tagCandidate) return undefined;
  const tag = tagCandidate[1];
  if (!tag) return undefined;

  const color = colorIdToColor(event.colorId || "0");

  return {
    title: tag,
    color,
  };
};

// ------------------------- Processing -------------------------

const calcDuration = (event: GEvent): number =>
  differenceInHours(
    new Date(event.end.dateTime || new Date()),
    new Date(event.start.dateTime || new Date())
  );

const isRecurring = (event: GEvent): boolean => !!event.recurringEventId;

export interface WeekTotal {
  tag: Tag;
  recurring: number;
  oneOff: number;
  total: number;
}

export const eventsToWeekTotal = (events: GEvent[]): WeekTotal[] => {
  const bins: Record<string, WeekTotal> = {};

  events.forEach((e) => {
    const tag = extractTag(e);
    if (!tag) return;
    const duration = calcDuration(e);
    const key = isRecurring(e) ? "recurring" : "oneOff";

    if (!bins[tag.title]) {
      bins[tag.title] = {
        tag,
        recurring: 0,
        oneOff: 0,
        total: 0,
      };
    }
    bins[tag.title][key] += duration;
  });

  return Object.entries(bins)
    .map(([_, e]) => ({
      ...e,
      total: (e.recurring || 0) + (e.oneOff || 0),
    }))
    .sort((a, b) => a.total - b.total);
};

export interface TagPercentage {
  tag: Tag;
  total: number;
}

export const weekTotalToTagPercentage = (
  weekTotal: WeekTotal[]
): TagPercentage[] =>
  weekTotal
    .map(({ tag, total }) => ({ tag, total }))
    .sort((a, b) => b.total - a.total);
