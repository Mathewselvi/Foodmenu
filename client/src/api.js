let base = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Remove trailing slash if present
if (base.endsWith('/')) {
    base = base.slice(0, -1);
}

const API_URL = base;

export const getFullImageUrl = (url) => {
    try {
        if (!url || typeof url !== 'string') return '';
        if (url.includes('/uploads/')) {
            const path = url.substring(url.indexOf('/uploads/'));
            return `${API_URL.replace('/api', '')}${path}`;
        }
        return url;
    } catch {
        return '';
    }
};

// Fetch for admin-only endpoints: adds the saved admin token and, if the server rejects it
// (expired, or issued by a different server), clears it so the admin is sent back to login.
export const ADMIN_SESSION_EXPIRED = 'admin-session-expired';

export const adminFetch = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 && token) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED));
        // The admin is being sent back to the login screen (with a "session expired" message).
        // Stop the caller here so it doesn't also throw / show "Error saving item" etc.
        return new Promise(() => {});
    }
    return res;
};

export default API_URL;
