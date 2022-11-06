import { differenceInMinutes } from "date-fns";

import { CheckboxDataInfo } from "../component/CheckboxGroup";
import { Tag } from "../component/Tag";

export type GEvent = gapi.client.calendar.Event;
export type GCalendarListEntry = gapi.client.calendar.CalendarListEntry;

export interface CalendarListEvent {
  calendar: GCalendarListEntry;
  events: GEvent[];
}

// ------------------------- API -------------------------

export const getCalendarLists = async () => {
  const res = await gapi.client.calendar.calendarList.list();
  return res.result.items;
};

export const getMultipleRangeEvents = async (
  calendars: GCalendarListEntry[],
  from: Date,
  to: Date
): Promise<CalendarListEvent[]> => {
  const responses = await Promise.all(
    calendars.map(async (c) => {
      const events = await getRangeEvents(c, from, to);
      return { calendar: c, events };
    })
  );
  return responses;
};

export const getRangeEvents = async (
  calendar: GCalendarListEntry,
  from: Date,
  to: Date
): Promise<GEvent[]> => {
  const res = await gapi.client.calendar.events.list({
    calendarId: calendar.id,
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

const colorIdToEventColor = (
  defaultColor: string,
  googleColorId?: string
): string =>
  googleColorId
    ? GOOLGE_CALENDAR_EVENT_COLORS[googleColorId].background
    : defaultColor;

// ------------------------- Tag -------------------------

const TAG_REGEX = /^#([^\s<]{1,16})/;

const extractTag = (
  calendar: GCalendarListEntry,
  event: GEvent
): Tag | undefined => {
  const tagCandidate = event.description?.match(TAG_REGEX);

  if (!tagCandidate) return undefined;
  const tag = tagCandidate[1];
  if (!tag) return undefined;

  const color = colorIdToEventColor(
    calendar.backgroundColor as string,
    event.colorId
  );

  return {
    title: tag,
    color,
  };
};

// ------------------------- Processing -------------------------

export const calendarListToCheckboxDataInfo = (
  calendarListEntry: GCalendarListEntry
): CheckboxDataInfo => {
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
  calendar: GCalendarListEntry;
  tag: Tag;
  recurring: number;
  oneOff: number;
  total: number;
}

export const eventsToWeekTotal = (
  calendarListEvents: CalendarListEvent[]
): WeekTotal[] => {
  const bins: Record<string, WeekTotal> = {};

  calendarListEvents.forEach((cle) => {
    cle.events.forEach((e) => {
      const tag = extractTag(cle.calendar, e);
      if (!tag) return;
      const duration = calcDuration(e);
      const key = isRecurring(e) ? "recurring" : "oneOff";

      if (!bins[tag.title]) {
        bins[tag.title] = {
          calendar: cle.calendar,
          tag,
          recurring: 0,
          oneOff: 0,
          total: 0,
        };
      }
      bins[tag.title][key] += +duration.toFixed(2);
    });
  });

  return Object.entries(bins)
    .map(([_, e]) => ({
      ...e,
      total: (e.recurring || 0) + (e.oneOff || 0),
    }))
    .sort((a, b) => a.total - b.total);
};

export const weekTotalToTags = (weekTotal: WeekTotal[]): Tag[] =>
  weekTotal.map((wt) => wt.tag);

export interface TagPercentage {
  calendar: GCalendarListEntry;
  tag: Tag;
  total: number;
}

export const weekTotalToTagPercentage = (
  weekTotal: WeekTotal[]
): TagPercentage[] =>
  weekTotal
    .map(({ calendar, tag, total }) => ({ calendar, tag, total }))
    .sort((a, b) => b.total - a.total);
