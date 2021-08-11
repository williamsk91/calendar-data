import { addHours } from "date-fns";

import { Tag } from "../component/Tag";
import {
  CalendarListEvent,
  GCalendarListEntry,
  GEvent,
  TagPercentage,
  WeekTotal,
  eventsToWeekTotal,
  weekTotalToTagPercentage,
  weekTotalToTags,
} from "./calendar";

export const getCalendarListsPlaceholder = (): GCalendarListEntry[] =>
  [
    {
      id: "personal",
      summary: "personal",
      backgroundColor: "#9fe1e7",
    },
    {
      id: "work",
      summary: "work",
      backgroundColor: "#4986e7",
    },
  ] as GCalendarListEntry[];

const getEventsPlaceholder = (): CalendarListEvent[] => [
  {
    calendar: getCalendarListsPlaceholder()[0],
    events: [
      ...initMultipleEvents(7, {
        id: "study",
        description: "#study",
        colorId: "10",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 2.5).toISOString(),
        },
        recurringEventId: "study",
      } as GEvent),
      ...initMultipleEvents(2, {
        id: "exercise",
        description: "#exercise",
        colorId: "4",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 2).toISOString(),
        },
        recurringEventId: "exercise",
      } as GEvent),
      {
        id: "exercise",
        description: "#exercise",
        colorId: "4",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 3).toISOString(),
        },
      } as GEvent,
      ...initMultipleEvents(7, {
        id: "sleep",
        description: "#sleep",
        colorId: "1",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 8).toISOString(),
        },
        recurringEventId: "sleep",
      } as GEvent),
      {
        id: "social",
        description: "#social",
        colorId: "5",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 4).toISOString(),
        },
        recurringEventId: "social",
      } as GEvent,
    ],
  },
  {
    calendar: getCalendarListsPlaceholder()[1],
    events: [
      ...initMultipleEvents(5, {
        id: "work",
        description: "#work",
        start: {
          dateTime: new Date().toISOString(),
        },
        end: {
          dateTime: addHours(new Date(), 8).toISOString(),
        },
        recurringEventId: "work",
      } as GEvent),
    ],
  },
];

const initMultipleEvents = (count: number, object: GEvent): GEvent[] =>
  Array.from(Array(count)).fill(object);

export const getWeekTotalPlaceholder = (): WeekTotal[] =>
  eventsToWeekTotal(getEventsPlaceholder());

export const getTagsPlaceholder = (): Tag[] =>
  weekTotalToTags(getWeekTotalPlaceholder());

export const getTagPercentagePlaceholder = (): TagPercentage[] =>
  weekTotalToTagPercentage(getWeekTotalPlaceholder());
