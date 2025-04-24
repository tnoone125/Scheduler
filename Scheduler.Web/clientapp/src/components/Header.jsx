import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsernameFromToken } from '../util/token.js';
import LoadingOverlay from "./LoadingOverlay";

export default function Header({ onLogout }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem("jwtScheduler");

    const styles = {
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
        },
        greeting: {
            fontSize: '16px',
            fontWeight: 'bold',
        },
        logoutButton: {
            backgroundColor: '#6E7F80',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
        },
    };

    const username = getUsernameFromToken(token);

    const handleLogout = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("jwtScheduler");
        if (token) {
            try {
                const response = await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                });
            } catch (error) {
                console.error("Error logging out:", error);
            }
        }
        onLogout(null);
        setIsLoading(false);
        navigate('/login');
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <header style={styles.header}>
                <div style={styles.greeting}>Hello, {username}</div>

                {username === 'admin' && <button style={styles.logoutButton} onClick={() => navigate('/dashboard')}>Admin Dashboard</button>}
                <button style={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </header>
        </>
    );
};