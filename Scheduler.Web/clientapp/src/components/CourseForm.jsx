import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import TimeslotSummary from "./TimeslotSummary";
import { getDepartmentsFromInstructors } from "../util/departments"
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from "./LoadingOverlay";

export default function CourseForm() {
    const { courses, setCourses, timeslots, teachers, rooms, setScheduleResults } = useContext(AppContext);
    const [hoverXIndex, setHoverXIndex] = useState(null);
    const [preferredSlots, setPreferredSlots] = useState([[]]);
    const [invalidMessages, setInvalidMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const departments = getDepartmentsFromInstructors(teachers);
    const navigate = useNavigate();

    const submitForm = async () => {
        setIsLoading(true);
        console.log(JSON.stringify({ instructors: teachers, rooms: rooms, courses: courses, timeslots: timeslots }));
        try {
            const response = await fetch('/api/scheduler/submitSettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ instructors: teachers, rooms: rooms, courses: courses, timeslots: timeslots })
            });
            const responseData = await response.json();

            if (response.ok) {
                setIsLoading(false);
                setScheduleResults(responseData.results);
                navigate('/schedule');
            } else {
                setIsLoading(false);
                navigate('/errorPage', { state: { errorMessage: responseData.message } });
                console.error('Error: ', responseData.results);
            }
        } catch (error) {
            navigate('/errorPage', { state: { errorMessage: "" } });
            console.error("Error: ", error);
        }
    };

    const handleChange = (index, field, value) => {
        const updatedCourses = [...courses];
        updatedCourses[index][field] = (field.includes("enrollment") || field.includes("numberOfSections")) ? (value === "" ? "" : Number(value)) : value;

        setCourses(updatedCourses);
        createValidationMessages();
    };

    const handleUpdatedSlots = (index, event) => {
        let x = preferredSlots;
        x[index] = event.value;
        setPreferredSlots([...x]);
        handleChange(index, "preferredTimeslots", event.value);
    };

    const removeCourse = (index) => {
        let updatedCourses = courses.filter((_, i) => i !== index);
        if (updatedCourses.length == 0) {
            updatedCourses = [
                { name: "", displayName: "", numberOfSections: null, enrollment: null, preferredTimeslots: [] }
            ];
        }
        setCourses(updatedCourses);
    };

    const addCourse = () => {
        setCourses([...courses, { name: "", displayName: "", numberOfSections: null, enrollment: null, preferredTimeslots: [] }]);
        setPreferredSlots([...preferredSlots, []]);
        createValidationMessages();
    };

    const duplicateCourses = () => {
        let dups = false;
        courses.forEach((course, i) => {
            for (let j = i + 1; j < courses.length; j++) {
                if (courses[j].name === course.name) {
                    dups = true;
                    break;
                }
            }
        });
        return dups;
    }

    const createValidationMessages = () => {
        let messages = [];

        courses.forEach(course => {
            if (!course.name || course.name === "") {
                messages.push("Course needs a name.");
            } else if (!course.displayName || course.displayName === "") {
                messages.push("Course needs a display name.");
            } else if (course.enrollment === null || course.enrollment < 1) {
                messages.push("Enrollment should be a positive number.");
            } else if (course.department == "") {
                messages.push("Course must have a department.");
            } else if (course.numberOfSections === null || course.numberOfSections < 1) {
                messages.push("Each course should have at least one section.");
            } else {
                messages.push("");
            }
        });
        setInvalidMessages(messages);
    };

    const validCourses = () => {
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].name === "")
                return false;
            else if (courses[i].displayName === "" || courses[i].department === "")
                return false;
            else if (courses[i].enrollment <= 0)
                return false;
            else if (courses[i].numberOfSections <= 0)
                return false;
        }
        return true;
    }

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <p>For each course, please input a full name, a shortened display name (e.g. MAT200), the number of sections that should run, and the enrollment for each section.</p>
            <p>Optionally, you may include the preferred timeslots in which you would want that course to run. You may check up to three.</p>
            <p>Check off the numeric values from the list of "expressions", which can be found below:</p>
            {timeslots.length > 0 && <TimeslotSummary expressions={timeslots} />}
            <div className="p-4 space-y-4">
                {courses.map((course, index) => (
                    <div key={index} className="flex space-x-2 entry-row">
                        <InputText
                            placeholder="Name"
                            value={course.name}
                            onChange={(e) => handleChange(index, "name", e.target.value)}
                        />
                        <InputText
                            placeholder="Display Name"
                            value={course.displayName}
                            onChange={(e) => handleChange(index, "displayName", e.target.value)}
                        />
                        <Dropdown
                            value={course.department}
                            placeholder="Department"
                            onChange={(e) => handleChange(index, "department", e.target.value)}
                            options={departments}
                        />
                        <InputNumber
                            min={1}
                            step={1}
                            mode="decimal"
                            useGrouping={false}
                            placeholder="Number of Sections"
                            value={course.numberOfSections}
                            onChange={(e) => handleChange(index, "numberOfSections", e.value)}
                        />
                        <InputNumber
                            min={1}
                            step={1}
                            mode="decimal"
                            useGrouping={false}
                            placeholder="Enrollment (for a single section)"
                            value={course.enrollment}
                            onChange={(e) => handleChange(index, "enrollment", e.value)}
                        />
                        <MultiSelect
                            value={preferredSlots[index]}
                            onChange={(e) => handleUpdatedSlots(index, e)}
                            options={Array.from(Array(timeslots.length).keys()).map(k => k+1)}
                            display="chip"
                            placeholder="Select Preferred Slots"
                            maxSelectedLabels={3}
                            className="w-full md:w-20rem"
                        />
                        <span style={hoverXIndex === index ? { cursor: "pointer" } : { cursor: "auto" }} onMouseEnter={() => setHoverXIndex(index)} onMouseLeave={() => setHoverXIndex(null)}>
                            <X size={20} color={hoverXIndex === index ? "red" : "black"} onClick={() => removeCourse(index)} />
                        </span>
                    </div>
                ))}
                <div className='button-section'>
                    <button onClick={() => navigate("/timeslots")}>Back</button>
                    <button onClick={addCourse}>Add Another</button>
                    <div className="tooltip-container">
                        <button
                            className='submit'
                            disabled={duplicateCourses() || !validCourses()}
                            onClick={submitForm}>
                            Submit
                        </button>
                        {((duplicateCourses() || !validCourses()) && (
                            <span className="tooltip">
                                {
                                    invalidMessages.filter(v => v && v !== "").length > 0
                                        ? invalidMessages.filter(v => v && v !== "")[0]
                                        : courses.some(t => t.name === "" && t.displayName === "")
                                            ? "Add a course to continue"
                                            : duplicateCourses() ? "No duplicate courses" : "Invalid Input"
                                }
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}