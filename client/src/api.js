let base = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Remove trailing slash if present
if (base.endsWith('/')) {
    base = base.slice(0, -1);
}

const API_URL = base;

export default API_URL;
