import { endOfWeek, startOfWeek } from "date-fns";

type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const getCurrentWeekRange = (
  now: Date = new Date(),
  weekStartsOn: WeekStartsOn = 1
): [Date, Date] => [
  startOfWeek(now, { weekStartsOn }),
  endOfWeek(now, { weekStartsOn }),
];
