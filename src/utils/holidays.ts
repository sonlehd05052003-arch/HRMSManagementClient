import type { Dayjs } from "dayjs";
import { request } from "./request";

export interface IHoliday {
    holidayId: number;
    /** YYYY-MM-DD */
    holidayDate: string;
    name: string;
    isPaid: boolean;
}

export async function fetchHolidays(year: number): Promise<IHoliday[]> {
    const response = await request({ url: "/Holiday", method: "GET", params: { year } });
    return response.data as IHoliday[];
}

/** The holidays of every year the range touches, as a set of YYYY-MM-DD strings. */
export async function holidayDatesBetween(start: Dayjs, end: Dayjs): Promise<Set<string>> {
    const years = [];
    for (let y = start.year(); y <= end.year(); y++) years.push(y);
    const lists = await Promise.all(years.map(fetchHolidays));
    return new Set(lists.flat().map(h => h.holidayDate));
}

/** Leave days in a range: Monday to Friday, public holidays excluded (payroll counts them the same way). */
export function countLeaveDays(start: Dayjs, end: Dayjs, holidays: Set<string>): number {
    let days = 0;
    for (let d = start.startOf("day"); !d.isAfter(end, "day"); d = d.add(1, "day")) {
        const weekday = d.day();
        if (weekday !== 0 && weekday !== 6 && !holidays.has(d.format("YYYY-MM-DD"))) days++;
    }
    return days;
}
