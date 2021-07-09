import { differenceInHours, endOfWeek, startOfWeek } from "date-fns";

type GEvent = gapi.client.calendar.Event;

// ------------------------- API -------------------------

export const getWeekEvents = async (date: Date): Promise<GEvent[]> => {
  const res = await gapi.client.calendar.events.list({
    calendarId: "sephereus9@gmail.com",
    timeMin: startOfWeek(date).toISOString(),
    timeMax: endOfWeek(date).toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
    q: "#",
  });

  return res.result.items;
};

// ------------------------- Tag -------------------------

interface Tag {
  title: string;
}

const extractTag = (event: GEvent): Tag | undefined => {
  const tagRegex = /^#([\w-]{0,16})/;
  const tagCandidate = event.description?.match(tagRegex);

  if (!tagCandidate) return undefined;
  const tag = tagCandidate[1];
  if (!tag) return undefined;

  return {
    title: tag,
  };
};

// ------------------------- Processing -------------------------

const calcDuration = (event: GEvent): number =>
  differenceInHours(
    new Date(event.end.dateTime || new Date()),
    new Date(event.start.dateTime || new Date())
  );

const isRecurring = (event: GEvent): boolean => !!event.recurringEventId;

interface WeekTotal {
  tag: string;
  recurring: number;
  oneOff: number;
  total: number;
}

export const eventsToWeekTotal = (events: GEvent[]): WeekTotal[] => {
  const bins: Record<string, { recurring: number; oneOff: number }> = {};

  events.forEach((e) => {
    const tag = extractTag(e);
    if (!tag) return;
    const duration = calcDuration(e);
    const key = isRecurring(e) ? "recurring" : "oneOff";

    if (!bins[tag.title]) {
      bins[tag.title] = {
        recurring: 0,
        oneOff: 0,
      };
    }
    bins[tag.title][key] += duration;
  });

  return Object.entries(bins).map(([tag, e]) => {
    return {
      tag,
      ...e,
      total: (e.recurring || 0) + (e.oneOff || 0),
    };
  });
};
