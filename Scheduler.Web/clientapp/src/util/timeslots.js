/** selectedSlots will be an array such as ["Monday-8:00am","Monday-8:15am","Monday-8:30am","Tuesday-8:30am", "Tuesday-8:45am"]
  * The resulting array of slots should be grouped by day, compacted to the starting and ending time
  * No AM / PM in resulting array - military time instead
  * {"Monday": [{"start": "8:00", "end": "8:45"}], "Tuesday": [{"start": "8:30", "end": "9:00"}]}
  */ 
export default function createSlots(selectedSlots) {
    const MINUTE_DIFF = 15;
    if (selectedSlots.length === 0) {
        return [];
    }
    const objSlots = selectedSlots.map(s => {
        const dash = s.indexOf("-");
        return {
            day: s.substring(0, dash),
            time: s.substring(dash + 1, s.length - 3),
            amPm: s.substring(s.length - 2, s.length)
        };
    });

    const militaryTimeSlots = objSlots.map(s => {
        let h = Number(s.time.substring(0, s.time.indexOf(":")));
        let m = Number(s.time.substring(s.time.indexOf(":") + 1, s.time.length));
        if (s.amPm === "PM" && h !== 12) {
            h += 12;
        } else if (s.amPm === "AM" && h === 12) {
            h = 0;
        }

        return {
            day: s.day,
            hour: h,
            minute: m
        };
    });

    const ordered = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const orderFunc = (a, b) => {
        const orderMap = {};
        for (let i = 0; i < ordered.length; i++) {
            orderMap[ordered[i]] = i;
        }

        if (orderMap[a.day] < orderMap[b.day]) {
            return -1;
        } else if (orderMap[a.day] > orderMap[b.day]) {
            return 1;
        }

        if (a.hour !== b.hour) {
            return a.hour - b.hour;
        }

        return a.minute - b.minute;
    }

    const sortedMilitarySlots = militaryTimeSlots.sort(orderFunc);

    let finalSlots = {};
    let currentDay = null;
    let startHour, startMinute, prevHour, prevMinute;

    sortedMilitarySlots.forEach(({ day, hour, minute }) => {
        if (currentDay === null) {
            finalSlots[day] = [];
            currentDay = day;
            startHour = hour;
            startMinute = minute;
            prevHour = hour;
            prevMinute = minute;
        } else if (currentDay !== day) {
            // ADD
            let endHour = prevHour;
            let endMinute = prevMinute;

            if (endMinute + MINUTE_DIFF >= 60) {
                endMinute = (endMinute + MINUTE_DIFF) % 60;
                endHour += 1;
            } else {
                endMinute += MINUTE_DIFF;
            }
            finalSlots[currentDay].push({
                start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
            });

            currentDay = day;
            finalSlots[day] = [];
            startHour = hour;
            startMinute = minute;
            prevHour = hour;
            prevMinute = minute;
        } else if ((hour === prevHour && minute === (prevMinute + MINUTE_DIFF)) || (hour === prevHour + 1 && (minute === (prevMinute + MINUTE_DIFF) % 60) && (60 <= (prevMinute + MINUTE_DIFF)))) {
            prevHour = hour;
            prevMinute = minute;
        } else {
            let endHour = prevHour;
            let endMinute = prevMinute;

            if (endMinute + MINUTE_DIFF >= 60) {
                endMinute = (endMinute + MINUTE_DIFF) % 60;
                endHour += 1;
            } else {
                endMinute += MINUTE_DIFF;
            }
            finalSlots[currentDay].push({
                start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
            });

            startHour = hour;
            startMinute = minute;
            prevHour = hour;
            prevMinute = minute;
        }
    });

    // ADD
    let endHour = prevHour;
    let endMinute = prevMinute;

    if (endMinute + MINUTE_DIFF >= 60) {
        endMinute = (endMinute + MINUTE_DIFF) % 60;
        endHour += 1;
    } else {
        endMinute += MINUTE_DIFF;
    }

    finalSlots[currentDay].push({
        start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
    });

    return finalSlots;
}