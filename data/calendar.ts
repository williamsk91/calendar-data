import { differenceInMinutes } from "date-fns";

import { Tag } from "../component/Tag";

export type GEvent = gapi.client.calendar.Event;
type GCalendarListEntry = gapi.client.calendar.CalendarListEntry;

// ------------------------- API -------------------------

export const getCalendarLists = async () => {
  const res = await gapi.client.calendar.calendarList.list();
  return res.result.items;
};

export const getMultipleRangeEvents = async (
  ids: string[],
  from: Date,
  to: Date
): Promise<GEvent[]> => {
  const responses = await Promise.all(
    ids.map((id) => getRangeEvents(id, from, to))
  );
  return responses.flatMap((res) => res);
};

export const getRangeEvents = async (
  id: string,
  from: Date,
  to: Date
): Promise<GEvent[]> => {
  const res = await gapi.client.calendar.events.list({
    calendarId: id,
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
    q: "#",
  });
  return res.result.items;
};

interface COLOR {
  background: string;
  foreground: string;
}

/**
 * Hardcoded data of Google calendar colors
 *
 * @see https://developers.google.com/calendar/api/v3/reference/colors/get
 */
const GOOLGE_CALENDAR_EVENT_COLORS: Record<string, COLOR> = {
  "1": {
    background: "#a4bdfc",
    foreground: "#1d1d1d",
  },
  "2": {
    background: "#7ae7bf",
    foreground: "#1d1d1d",
  },
  "3": {
    background: "#dbadff",
    foreground: "#1d1d1d",
  },
  // 1 2
  "4": {
    background: "#ff887c",
    foreground: "#1d1d1d",
  },
  "5": {
    background: "#fbd75b",
    foreground: "#1d1d1d",
  },
  "6": {
    background: "#ffb878",
    foreground: "#1d1d1d",
  },
  "7": {
    background: "#46d6db",
    foreground: "#1d1d1d",
  },
  "8": {
    background: "#e1e1e1",
    foreground: "#1d1d1d",
  },
  "9": {
    background: "#5484ed",
    foreground: "#1d1d1d",
  },
  "10": {
    background: "#51b749",
    foreground: "#1d1d1d",
  },
  "11": {
    background: "#dc2127",
    foreground: "#1d1d1d",
  },
};

const colorIdToEventColor = (googleColorId?: string): string =>
  GOOLGE_CALENDAR_EVENT_COLORS[googleColorId || "1"].background;

// ------------------------- Tag -------------------------

const extractTag = (event: GEvent): Tag | undefined => {
  const tagRegex = /^#([\w-]{0,16})/;
  const tagCandidate = event.description?.match(tagRegex);

  if (!tagCandidate) return undefined;
  const tag = tagCandidate[1];
  if (!tag) return undefined;

  const color = colorIdToEventColor(event.colorId);

  return {
    title: tag,
    color,
  };
};

// ------------------------- Processing -------------------------

export interface CalendarInfo {
  id: string;
  title: string;
  color: string;
}

export const calendarListEntryToCalendar = (
  calendarListEntry: GCalendarListEntry
): CalendarInfo => {
  const { id, summary, backgroundColor } = calendarListEntry;
  return {
    id,
    title: summary,
    color: backgroundColor as string,
  };
};

const calcDuration = (event: GEvent): number =>
  differenceInMinutes(
    new Date(event.end.dateTime || new Date()),
    new Date(event.start.dateTime || new Date())
  ) / 60;

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
