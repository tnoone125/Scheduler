import React from 'react';
import { Navigate } from 'react-router-dom';
import { getIsExpired } from "../../util/token.js";
import { jwtDecode } from 'jwt-decode';

export default function AdminProtectedRoute({ children }) {
    const token = localStorage.getItem("jwtScheduler");

    if (!token || getIsExpired(token)) {
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.sub !== "admin") {
            return <Navigate to="/unauthorized" />;
        }
        return children;
    } catch (error) {
        console.error("Error decoding token:", error);
        return <Navigate to="/login" />;
    }
};