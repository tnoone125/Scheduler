import { useState, useEffect } from 'react';
import InstructorForm from "./InstructorForm";
import RoomForm from "./RoomsForm";
import TimeslotForm from "./TimeslotForm";
import CourseForm from "./CourseForm";
import ErrorPage from "./ErrorPage";
import Schedule from "./Schedule";
import Unauthorized from "./Unauthorized";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminProtectedRoute from "./auth/AdminProtectedRoute";
import Login from "./auth/Login";
import { AnimatePresence } from 'framer-motion';
import AnimationWrapper from "./AnimationWrapper";
import AdminDashboard from './AdminDashboard';
import Header from "./Header";
import { Routes, Route } from 'react-router-dom';
import { getUsernameFromToken, getIsExpired } from '../util/token.js';
import '../css/App.css';
import "primereact/resources/themes/viva-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import fplogo from "../assets/fp_logo.jpg";

export default function App() {
    const [localToken, setLocalToken] = useState(localStorage.getItem("jwtScheduler"))
    const showHeader = localToken ? (getIsExpired(localToken) ? false : !!getUsernameFromToken(localToken)) : false;

    console.log(localToken);

    useEffect(() => {
        const handleStorageChange = () => {
            setLocalToken(localStorage.getItem('jwtScheduler'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateToken = (newToken) => {
        if (newToken) {
            localStorage.setItem("jwtScheduler", newToken);
        } else {
            localStorage.removeItem("jwtScheduler");
        }
        setLocalToken(newToken);
    };

    return (
        <>
            {showHeader && <Header onLogout={updateToken} />}
            <img src={fplogo} />
            <h2>High School Course Scheduler</h2>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route
                        path="/unauthorized"
                        element={
                            <Unauthorized />
                        }
                    />
                    {
                        (localToken && !getIsExpired(localToken))
                            ? <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <InstructorForm />
                                </ProtectedRoute>
                            }
                        /> : <Route path="/" element={<Login onLogin={updateToken} />} />}
                    <Route path="/login" element={<Login onLogin={updateToken} />} />
                    <Route
                        path="/instructors"
                        element={
                            <ProtectedRoute>
                                <InstructorForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <AdminProtectedRoute>
                                <AdminDashboard />
                            </AdminProtectedRoute>
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