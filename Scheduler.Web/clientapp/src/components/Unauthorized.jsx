import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Unauthorized() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Unauthorized</h1>
            <p>You do not have permission to access this page.</p>
            <Link to={"/"}>Go to Home</Link>
        </div>
    );
};
