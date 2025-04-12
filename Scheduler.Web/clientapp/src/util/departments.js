export function getDepartmentsFromInstructors(instructors) {
    return [...new Set(instructors.map(i => i.department))];
}