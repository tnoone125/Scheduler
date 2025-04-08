import { useState } from "react";
import 'primeicons/primeicons.css';
import "../css/TimeslotSummary.css";

function convertMilitaryToStandard(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function TimeslotSummary({ expressions }) {
    const [displaying, setDisplaying] = useState(false);

    if (!expressions.length) return null;

    const dayShortener = {
        "Monday": "M",
        "Tuesday": "Tu",
        "Wednesday": "W",
        "Thursday": "Th",
        "Friday": "F",
    };

    let expressionsDescrs = expressions.map(expression => {
        const slotSelections = Object.values(expression);

        let canShortenDescription = true;
        if (slotSelections.every(s => s.length === 1)) {
            const firstStart = slotSelections[0][0].start;
            const firstEnd = slotSelections[0][0].end;
            for (let i = 1; i < slotSelections.length; i++) {
                if (slotSelections[i][0].start !== firstStart || slotSelections[i][0].end !== firstEnd) {
                    canShortenDescription = false;
                }
            }
        } else {
            canShortenDescription = false;
        }

        if (canShortenDescription) {
            return [
                Object.keys(expression).map(d => dayShortener[d]).join("") +
                ": " + convertMilitaryToStandard(slotSelections[0][0].start) +
                "-" + convertMilitaryToStandard(slotSelections[0][0].end)
            ];
        }

        return Object.keys(expression).map(day => {
            const allTimes = expression[day];
            const commaSepTimes = allTimes.map(t => convertMilitaryToStandard(t.start) + "-" + convertMilitaryToStandard(t.end)).join(", ");
            return dayShortener[day] + ": " + commaSepTimes;
        });
    });

    const jsx = displaying ? (
        <>
            <div className="summary-header-open">
                <div className='expressions'>{expressions.length} expression{expressions.length > 1 ? "s" : ""}</div>
                <ol className="summary-list">
                    {expressionsDescrs.map((descr, index) => (
                        <li key={index}>
                            {descr.length === 1 ? descr[0] : (
                                <ul>{descr.map((d, i) => <li key={i}>{d}</li>)}</ul>
                            )}
                        </li>
                    ))}
                </ol>
                <span className="collapse" onClick={() => setDisplaying(!displaying)}><i className='pi pi-chevron-right' /></span>
            </div>
        </>
    ) : (
            <div className="summary-header-closed">
                <span>{expressions.length} expression{expressions.length > 1 ? "s" : ""}</span>
                <span className="collapse" onClick={() => setDisplaying(!displaying)}><i className="pi pi-chevron-down" /></span>
            </div>
    );

    return (
        <div className="timeslot-summary">
            {jsx}
        </div>
    );
}
