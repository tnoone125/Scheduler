import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ErrorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { errorMessage } = location.state || {};
    if (errorMessage && errorMessage !== "") {
        return (
            <>
                <div>
                    The scheduler ran into an error, with the following message:
                    <br />
                    <p>{props.errorMessage}</p>
                    <p>Return to the homepage to alter your settings.</p>
                    <button onClick={() => navigate('/')}>Return Home</button>
                </div>
            </>
        );
    } else {
        return (
            <div>
                <p>The scheduler experienced an error. It may be transient. Go to the homepage to alter your settings or try again.</p>
                <button onClick={() => navigate('/')}>Return Home</button>
            </div>
        );
    }
}