import InstructorForm from "./InstructorForm";
import RoomForm from "./RoomsForm";
import TimeslotForm from "./TimeslotForm";
import CourseForm from "./CourseForm";
import ErrorPage from "./ErrorPage";
import Schedule from "./Schedule";
import { useContext } from 'react';
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
                    <Route path='/' element={
                        <AnimationWrapper keyName="instructor">
                            <InstructorForm />
                        </AnimationWrapper>
                    } />
                    <Route path='/rooms' element={
                        <AnimationWrapper keyName="room">
                            <RoomForm />
                        </AnimationWrapper>
                    } />
                    <Route path='/timeslots' element={
                        <AnimationWrapper keyName="timeslots">
                            <TimeslotForm />
                        </AnimationWrapper>
                    } />
                    <Route path='/courses' element={
                        <AnimationWrapper keyName="courses">
                            <CourseForm />
                        </AnimationWrapper>
                    } />
                    <Route path='/schedule' element={
                        <AnimationWrapper keyName="schedule">
                            <Schedule />
                        </AnimationWrapper>
                    } />
                    <Route path='/errorPage' element={
                        <AnimationWrapper keyName="errorPage">
                            <ErrorPage />
                        </AnimationWrapper>
                    } />
                </Routes>
            </AnimatePresence>
        </>
    );
}