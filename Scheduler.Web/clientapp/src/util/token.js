import { jwtDecode } from 'jwt-decode';

// Function to decode the JWT and extract the username
export const getUsernameFromToken = (token) => {
    console.log(JSON.stringify(token));
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.sub || decoded.username;
    } catch (e) {
        console.error('Invalid token', e);
        return null;
    }
};

export const getIsExpired = (token) => {
    if (!token) return true;

    try {
        const decodedToken = jwtDecode(token);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return decodedToken.exp && decodedToken.exp < currentTimestamp;
    } catch {
        return true;
    }
};