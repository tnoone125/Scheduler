import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Dropdown } from "primereact/dropdown";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "../css/Schedule.css";

const displayStartToEnd = (start, end) => {
    var startHours = parseInt(start.split(":")[0], 10);
    var startMins = parseInt(start.split(":")[1], 10);
    var endHours = parseInt(end.split(":")[0], 10);
    var endMins = parseInt(end.split(":")[1], 10);

    var startAmPm = startHours >= 12 ? "PM" : "AM";
    var endAmPm = endHours >= 12 ? "PM" : "AM";
    if (startHours > 12) {
        startHours = startHours % 12;
    }
    if (endHours > 12) {
        endHours = endHours % 12;
    }
    return `${startHours}:${startMins<10?"0":""}${startMins}${startAmPm}-${endHours}:${endMins<10?"0":""}${endMins}${endAmPm}`;
};

const Schedule = () => {
    const TOTAL_MINUTES = 60 * (17 - 8);

    const { scheduleResults } = useContext(AppContext);
    const [viewRoom, setViewRoom] = useState(true);
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const teacherNames = [...new Set(scheduleResults.map(item => item.instructor.name))];
    const roomNames = [...new Set(scheduleResults.map(item => item.room.name))];

    const [selectedRoom, setSelectedRoom] = useState(roomNames[0] || null);
    const [selectedInstructor, setSelectedInstructor] = useState(teacherNames[0] || null);

    const filteredData = scheduleResults.filter((item) =>
        viewRoom ? item.room.name === selectedRoom : item.instructor.name === selectedInstructor
    );

    const getPositionAndHeight = (start, end) => {
        const startTime = parseInt(start.split(":"), 10) * 60 + parseInt(start.split(":")[1], 10);
        const endTime = parseInt(end.split(":"), 10) * 60 + parseInt(end.split(":")[1], 10);
        return {
            top: ((startTime - 480) / TOTAL_MINUTES) * 100 + 2 + "%", // 8:00 AM is 480 min from midnight, so it serves as 0
            height: ((endTime - startTime) / TOTAL_MINUTES) * 100 + "%" // Proportional height based on 8AM-5PM
        };
    };

    const exportToPDF = () => {
        const input = document.getElementById(`schedule-${viewRoom ? selectedRoom : selectedInstructor}`);

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const heightLeft = imgHeight;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${viewRoom ? selectedRoom : selectedInstructor} Schedule.pdf`);
        });
    };

    return (
        <div>
            <div>
                <button onClick={() => setViewRoom(!viewRoom)}>
                    View by {viewRoom ? "Instructor" : "Room"}
                </button>
                <Dropdown
                    value={viewRoom ? selectedRoom : selectedInstructor}
                    onChange={(e) => {
                        if (viewRoom) {
                            setSelectedRoom(e.target.value);
                        } else {
                            setSelectedInstructor(e.target.value);
                        }
                    }}
                    options={viewRoom ? roomNames : teacherNames}
                />
                <button onClick={exportToPDF}>Export to PDF</button>
            </div>

            <div id={`schedule-${viewRoom ? selectedRoom : selectedInstructor}`}>
                <p style={{ textAlign: "center" }}>Schedule for {viewRoom ? selectedRoom : selectedInstructor}</p>
                <div className="schedule-container">
                    {daysOfWeek.map(day => (
                        <div key={day} className="day-column">
                            <h4>{day}</h4>
                            {filteredData.map(course => {
                                const slot = course.expression.slots.find(s => s.day === daysOfWeek.indexOf(day) + 1);
                                if (slot) {
                                    const timeSlot = slot.timeSlots[0];
                                    const { top, height } = getPositionAndHeight(timeSlot.start, timeSlot.end);
                                    return (
                                        <div
                                            key={course.courseSection.sectionDisplayName}
                                            className="course-block"
                                            style={{ top, height }}
                                        >
                                            {course.courseSection.sectionDisplayName} ({viewRoom ? course.instructor.name : course.room.name})
                                            <br />
                                            {displayStartToEnd(timeSlot.start, timeSlot.end)}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
