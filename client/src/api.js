let base = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Remove trailing slash if present
if (base.endsWith('/')) {
    base = base.slice(0, -1);
}

const API_URL = base;

export const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
        const path = url.substring(url.indexOf('/uploads/'));
        return `${API_URL.replace('/api', '')}${path}`;
    }
    return url;
};

export default API_URL;
