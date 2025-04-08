import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { AutoComplete } from "primereact/autocomplete";
import { X } from 'lucide-react';
import '../css/App.css';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function InstructorForm() {
    const { teachers, setTeachers } = useContext(AppContext);
    const [hoverXIndex, setHoverXIndex] = useState(null);
    const [invalidMessages, setInvalidMessages] = useState([]);
    const [deptInputs, setDeptInputs] = useState([...teachers.map(t => t.department)]);

    const currentTeacherDepts = teachers.map(t => t.department).filter(d => d && d != "");
    const defaultDepartments = ['Mathematics', 'Computer Science', 'English', 'Theology', 'Classical Languages', 'Modern Languages', 'Social Studies', 'Science'];
    const mergedDepts = [...new Set(currentTeacherDepts.concat(defaultDepartments))];
    const [departments, setDepartments] = useState(mergedDepts);
    const navigate = useNavigate();

    useEffect(() => {
        createValidationMessages();
        const currentTeacherDeps = teachers.map(t => t.department).filter(d => d && d != "");
        const defaultDeps = ['Mathematics', 'Computer Science', 'English', 'Theology', 'Classical Languages', 'Modern Languages', 'Social Studies', 'Science'];
        const mergedDeps = [...new Set(currentTeacherDeps.concat(defaultDeps))];
        setDepartments(mergedDeps)
    }, [teachers]);

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const createValidationMessages = () => {
        let messages = [];

        teachers.forEach(teacher => {
            if (!teacher.name) {
                messages.push("Teacher needs a name.");
            } else if (!teacher.department) {
                messages.push("Teacher needs a department.");
            } else if (!coursesValid(teacher)) {
                messages.push("Invalid course minimum / maximum");
            } else {
                messages.push("");
            }
        });
        setInvalidMessages(messages);
    };

    const duplicateTeachers = () => {
        let dups = false;
        teachers.forEach((teacher, i) => {
            for (let j = i + 1; j < teachers.length; j++) {
                if (teachers[j].name === teacher.name && teachers[j].department === teacher.department) {
                    dups = true;
                    break;
                }
            }
        });
        return dups;
    }

    const getValidTeachers = (teachers) => {
        return teachers.filter((teacher, i) => {
            return teacher.name !== undefined && teacher.name !== null && teacher.name !== ""
                && teacher.department !== undefined && teacher.department !== null && teacher.department !== ""
                && coursesValid(teacher);
        });
    }

    const validateTeachers = (teachers) => {
        const valid = getValidTeachers(teachers);

        return valid.length > 0 && valid.length === teachers.length;
    }

    const coursesValid = (teacher) => {
        const min = teacher.courseMin === null ? null : Number(teacher.courseMin);
        const max = teacher.courseMax === null ? null : Number(teacher.courseMax);

        if (min === null || max === null || isNaN(min) || isNaN(max)) {
            return true; // Allow empty values
        }

        if (min > max) {
            return false;
        }

        return min >= 0 && max > 0;
    };

    const handleChange = (index, field, value) => {
        const updatedTeachers = [...teachers];
        updatedTeachers[index][field] = field.includes("course") ? (value === null ? null : Number(value)) : value;

        setTeachers(updatedTeachers);
    };

    const handleCustomDepartmentAdd = (index, customDepartment) => {
        if (!customDepartment || customDepartment.trim() === "")
            return;
        if (!departments.includes(customDepartment.trim())) {
            setDepartments([customDepartment.trim(), ...departments]);
        }
        handleChange(index, "department", customDepartment.trim());
    };

    const addTeacher = () => {
        setTeachers([...teachers, { name: "", department: "", courseMin: null, courseMax: null }]);
        setDeptInputs([...deptInputs, ""]);
    };

    const removeTeacher = (index) => {
        let updatedTeachers = teachers.filter((_, i) => i !== index);
        if (updatedTeachers.length == 0) {
            updatedTeachers = [
                { name: "", department: "", courseMin: null, courseMax: null }
            ];
        }
        setTeachers(updatedTeachers);
    };

    const filterSuggestions = (e) => {
        if (e.query) {
            let query = e.query.toLowerCase();

            if (query.length === 0) {
                setFilteredSuggestions(departments);
            } else {
                setFilteredSuggestions(
                    departments.filter(department =>
                        department.toLowerCase().includes(query)
                    )
                );
            }
        } else {
            setFilteredSuggestions(departments);
        }
    };

    const handleInputUpdate = (dept, i) => {
        let depts = [...deptInputs];
        depts[i] = dept;
        setDeptInputs(depts);
    }

    return (
        <div className="p-4 space-y-4">
            {teachers.map((teacher, index) => (
                <div key={index} className="flex space-x-2 entry-row">
                    <InputText
                        placeholder="Name"
                        value={teacher.name}
                        onChange={(e) => handleChange(index, "name", e.target.value)}
                    />
                    <AutoComplete
                        value={deptInputs[index]}
                        onChange={
                            (e) => handleInputUpdate(e.value, index)
                        }
                        onBlur={
                            (e) => {
                                handleCustomDepartmentAdd(index, deptInputs[index]);
                            }}
                        onSelect={
                            (e) => {
                                handleInputUpdate(e.value, index);
                                handleCustomDepartmentAdd(index, e.value);
                            }}
                        completeMethod={filterSuggestions}
                        suggestions={filteredSuggestions}
                        placeholder="Select or type department..."
                        dropdownMode="blank"
                        dropdownIcon="pi pi-chevron-down" 
                        dropdown
                    />
                    <InputNumber
                        min={0}
                        step={1}
                        mode="decimal"
                        useGrouping={false}
                        placeholder="Course Min (Optional)"
                        value={teacher.courseMin}
                        onChange={(e) => handleChange(index, "courseMin", e.value)}
                    />
                    <InputNumber
                        min={0}
                        step={1}
                        mode="decimal"
                        useGrouping={false}
                        placeholder="Course Max (Optional)"
                        value={teacher.courseMax}
                        onChange={(e) => handleChange(index, "courseMax", e.value)}
                    />
                    <span style={hoverXIndex === index ? { cursor: "pointer" } : { cursor: "auto" }} onMouseEnter={() => setHoverXIndex(index)} onMouseLeave={() => setHoverXIndex(null)}>
                        <X size={20} color={hoverXIndex === index ? "red" : "black"} onClick={() => removeTeacher(index)} />
                    </span>
                </div>
            ))}
            <div className='button-section'>
                <button onClick={addTeacher}>Add Another</button>
                <div className="tooltip-container">
                    <button
                        className='submit'
                        disabled={duplicateTeachers() || !validateTeachers(teachers)}
                        onClick={() => navigate('/rooms')}>
                        Submit
                    </button>
                    {(duplicateTeachers() || !validateTeachers(teachers)) && (
                        <span className="tooltip">
                            {
                                invalidMessages.filter(v => v && v !== "").length > 0
                                    ? invalidMessages.filter(v => v && v !== "")[0]
                                    : teachers.some(t => t.name === "" && t.department === "")
                                        ? "Add a teacher to continue"
                                        : duplicateTeachers() ? "No duplicate teachers" : "Invalid Input"
                            }
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
