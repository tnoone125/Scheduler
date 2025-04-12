import { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [teachers, setTeachers] = useState([
        { name: "", department: "", courseMin: null, courseMax: null }
    ]);
    const [rooms, setRooms] = useState([
        { name: "", studentCapacity: null, permittedDepartments: [] }
    ]);
    const [timeslots, setTimeslots] = useState([]);

    const [courses, setCourses] = useState([
        { name: "", displayName: "", department: "", numberOfSections: null, enrollment: null, preferredTimeslots: [] }
    ]);

    const [scheduleResults, setScheduleResults] = useState([]);

    const [statusMessage, setStatusMessage] = useState("");

    return (
        <AppContext.Provider value={{
            teachers,
            setTeachers,
            rooms,
            setRooms,
            timeslots,
            setTimeslots,
            courses,
            setCourses,
            statusMessage,
            setStatusMessage,
            scheduleResults,
            setScheduleResults,
        }}>
            {children}
        </AppContext.Provider>
    );
}