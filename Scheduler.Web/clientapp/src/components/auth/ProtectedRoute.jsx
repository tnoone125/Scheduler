import { Navigate } from "react-router-dom";
import { getIsExpired } from '../../util/token.js';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("jwtScheduler");

    if (!token || getIsExpired(token)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}