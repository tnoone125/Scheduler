import InstructorForm from "./InstructorForm";
import RoomForm from "./RoomsForm";
import TimeslotForm from "./TimeslotForm";
import CourseForm from "./CourseForm";
import ErrorPage from "./ErrorPage";
import Schedule from "./Schedule";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import { AnimatePresence } from 'framer-motion';
import AnimationWrapper from "./AnimationWrapper";
import { Routes, Route } from 'react-router-dom';
import '../css/App.css';
import "primereact/resources/themes/viva-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import fplogo from "../assets/fp_logo.jpg";

export default function App() {
    return (
        <>
            <img src={fplogo} />
            <h2>Fordham Preparatory School - Course Scheduler</h2>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/instructors"
                        element={
                            <ProtectedRoute>
                                <InstructorForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute>
                                <RoomForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/timeslots"
                        element={
                            <ProtectedRoute>
                                <TimeslotForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <CourseForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/schedule"
                        element={
                            <ProtectedRoute>
                                <Schedule />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/errorPage"
                        element={
                            <AnimationWrapper keyName="errorPage">
                                <ErrorPage />
                            </AnimationWrapper>
                        }
                    />
                </Routes>
            </AnimatePresence>
        </>
    );
}