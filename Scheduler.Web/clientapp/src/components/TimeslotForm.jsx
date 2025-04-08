import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import createSlots from "../util/timeslots.js";
import TimeslotSummary from "./TimeslotSummary";
import "../css/TimeslotTable.css";
export default function TimeslotForm() {
    const TIMESLOT_LENGTH = 15; // 15 minutes
    const MIN_TIME = 8; // 8:00am
    const MAX_TIME = 22; // 10:00pm (22:00)
    const navigate = useNavigate();

    const { timeslots, setTimeslots } = useContext(AppContext);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const times = Array.from({ length: (MAX_TIME - MIN_TIME) * (60 / TIMESLOT_LENGTH) + 1 }, (_, i) => {
        const hours = Math.floor((MIN_TIME * 60 + i * TIMESLOT_LENGTH) / 60);
        const minutes = (MIN_TIME * 60 + i * TIMESLOT_LENGTH) % 60;
        return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
    });

    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [mouseDown, setMouseDown] = useState(false);

    document.addEventListener('mousedown', () => {
        setMouseDown(true);
    });

    document.addEventListener('mouseup', () => {
        setMouseDown(false);
    });

    const toggleSlot = (day, time) => {
        const slotKey = `${day}-${time}`;
        setSelectedSlots((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(slotKey)) {
                newSelection.delete(slotKey);
            } else {
                newSelection.add(slotKey);
            }
            return newSelection;
        });
    };

    const saveSlots = () => {
        const currentTimeslots = timeslots;
        setTimeslots([...currentTimeslots, createSlots([...selectedSlots])]);
        setSelectedSlots(new Set());
        document.querySelectorAll("*").forEach((el) => {
            el.style.cssText = "";
        });
    };



    return (
        <>
            <p>Please choose all the <b>expressions</b> which are the sets of timeslots that the scheduler may assign a course to.</p>
            <p>An example of an expression can be <b>MWF 10:00am-11:00am</b>, or <b>TuTh 1:00pm-2:30pm</b>. The scheduler allows you to also input differing times for each of the days of that expression (e.g. an expression can be <b>M 8:00am-9:00am</b>, <b>Tu 11:00am-12:00pm</b>, <b>Fri 2:00pm-2:45pm</b>. Simply click all table cells of the timeslots you wish to include as a single expression.</p>
            {timeslots.length > 0 && <TimeslotSummary expressions={timeslots} />}

            <div className="button-section">
                <button onClick={() => navigate("/rooms")}>Go Back</button>
                <button
                    className="mt-4 bg-green-500 text-white p-2 rounded"
                    onClick={saveSlots}
                    disabled={selectedSlots.length === 0}
                >
                    Save Selection and Add Another
                </button>
                <button disabled={timeslots.length === 0} onClick={() => navigate("/courses")}>Submit</button>
            </div>

            <div className="p-4">
                <table className="border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Time</th>
                            {days.map((day) => (
                                <th key={day} className="border border-gray-300 p-2">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time) => (
                            <tr key={time}>
                                <td className="border border-gray-300 p-2 text-center">{time}</td>
                                {days.map((day) => {
                                    const slotKey = `${day}-${time}`;
                                    return (
                                        <td
                                            key={slotKey}
                                            className={`border border-gray-300 p-2 ${selectedSlots.has(slotKey) ? "filled" : ""
                                                }`}
                                            onMouseDown={(e) => {
                                                if (!selectedSlots.has(slotKey)) {
                                                    e.currentTarget.style.backgroundColor = "green";
                                                } else {
                                                    e.currentTarget.style.backgroundColor = "white";
                                                }
                                                e.preventDefault();
                                                toggleSlot(day, time);

                                            }}
                                            onMouseEnter={(e) => {
                                                if (e.buttons === 1) toggleSlot(day, time);
                                                if (!selectedSlots.has(slotKey) && !mouseDown) {
                                                    e.currentTarget.style.backgroundColor = "#CEFAD0";
                                                } else {
                                                    e.currentTarget.style.backgroundColor = "green";
                                                }
                                                e.currentTarget.style.cursor = "pointer";
                                            }}
                                            onMouseOut={(e) => {
                                                if (selectedSlots.has(slotKey)) {
                                                    e.currentTarget.style.backgroundColor = "green";
                                                } else {
                                                    e.currentTarget.style.backgroundColor = "white";
                                                }
                                            }}
                                        >   
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="button-section">
                    <button
                        className="mt-4 bg-green-500 text-white p-2 rounded"
                        onClick={() => {
                            saveSlots();
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }}
                        disabled={selectedSlots.length === 0}
                    >
                        Save Selection and Add Another
                    </button>
                </div>
            </div>
        </>
    );
}