import React from 'react';
import '../css/LoadingOverlay.css';

export default function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loading-circle"></div>
        </div>
    );
}