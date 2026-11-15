import { getFullImageUrl } from './api';

const unsplash = (id, w, h) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

// Display order + labels + photos for the menu categories.
// Keys must match the `category` values stored in the database (see server/seedMenu.js).
export const MENU_CATEGORIES = [
    { key: 'STARTERS', label: 'Starters', photo: '1562967914-608f82629710' },
    { key: 'AL-FAHAM', label: 'Al-Faham', photo: '1610057099443-fde8c4d50f91' },
    { key: 'MANDHI', label: 'Mandhi', local: '/images/mandhi.jpg' },
    { key: 'TANDOOR', label: 'Tandoor', photo: '1626074353765-517a681e40be' },
    { key: 'BIRIYANI', label: 'Biriyani', photo: '1563379091339-03b21ab4a4f8' },
    { key: 'NON VEG GRAVIES', label: 'Non-Veg Gravies', photo: '1603894584373-5ac82b2ae398' },
    { key: 'BUFFALO', label: 'Buffalo', photo: '1596797038530-2c107229654b' },
    { key: 'SEA FOOD', label: 'Sea Food', photo: '1559847844-5315695dadae' },
    { key: 'VEG GRAVIES', label: 'Veg Gravies', photo: '1588166524941-3bf61a9c41db' },
    { key: 'FRIED RICE', label: 'Fried Rice', photo: '1603133872878-684f208fb84b' },
    { key: 'NOODLES', label: 'Noodles', photo: '1585032226651-759b368d7246' },
    { key: 'RICE', label: 'Rice', photo: '1516684732162-798a0062be99' },
    { key: 'BREADS', label: 'Breads', photo: '1565557623262-b51c2513a641' },
    { key: 'SOUPS', label: 'Soups', photo: '1547592166-23ac45744acd' },
    { key: 'SALADS', label: 'Salads', photo: '1512621776951-a57141f2eefd' },
    { key: 'MOJITOS', label: 'Mojitos', photo: '1513558161293-cdaf765ed2fd' },
    { key: 'LIME', label: 'Lime', photo: '1621263764928-df1444c5e859' },
    { key: 'HOT BEVERAGES', label: 'Hot Beverages', photo: '1544787219-7f47ccb76574' },
];

export const CATEGORY_KEYS = MENU_CATEGORIES.map((c) => c.key);

const byKey = new Map(MENU_CATEGORIES.map((c) => [c.key, c]));

const FALLBACK_PHOTO = '1504674900247-0877df9cc836';

const titleCase = (s) => s.toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());

export const getCategoryLabel = (key) => byKey.get(key)?.label || titleCase(key || 'Other');

export const getCategoryImage = (key, w = 600, h = 400) => {
    const meta = byKey.get(key);
    if (meta?.local) return meta.local;
    return unsplash(meta?.photo || FALLBACK_PHOTO, w, h);
};

// A dish's own photo (uploaded from admin) wins; otherwise use its category photo.
export const getProductImage = (product, w = 160, h = 160) =>
    getFullImageUrl(product?.imageUrl) || getCategoryImage(product?.category, w, h);

export const categorySlug = (key) => `cat-${String(key).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// Known categories in menu order, unknown ones (added from admin) after them in first-seen order.
export const sortCategories = (keys) => {
    const rank = (k) => {
        const i = CATEGORY_KEYS.indexOf(k);
        return i === -1 ? CATEGORY_KEYS.length : i;
    };
    return [...keys].sort((a, b) => rank(a) - rank(b));
};

// Seasonal items are stored with price 0 and cannot be ordered until admin sets a price.
export const isSeasonal = (product) => !(Number(product?.price) > 0);

const SIZE_RE = /^(.*?)\s*\((Quarter|Half|Full)\)$/i;
const SIZE_ORDER = ['quarter', 'half', 'full'];

/**
 * Groups "X (Quarter)", "X (Half)", "X (Full)" into one row with a size picker.
 * Returns [{ type: 'single', item } | { type: 'sizes', name, variants: [{ size, item }] }].
 */
export const groupBySize = (items) => {
    const rows = [];
    const groups = new Map();
    for (const item of items) {
        const match = item.name?.match(SIZE_RE);
        if (!match) {
            rows.push({ type: 'single', key: item._id, item });
            continue;
        }
        const [, base, size] = match;
        let group = groups.get(base);
        if (!group) {
            group = { type: 'sizes', key: `${item.category}:${base}`, name: base, variants: [] };
            groups.set(base, group);
            rows.push(group);
        }
        group.variants.push({ size: titleCase(size), item });
    }
    return rows.map((row) => {
        if (row.type !== 'sizes') return row;
        if (row.variants.length === 1) return { type: 'single', key: row.variants[0].item._id, item: row.variants[0].item };
        row.variants.sort((a, b) => SIZE_ORDER.indexOf(a.size.toLowerCase()) - SIZE_ORDER.indexOf(b.size.toLowerCase()));
        return row;
    });
};

// Room-service fee configured per restaurant in admin (defaults to ₹500 when not set).
export const getServiceCharge = (restaurant, subtotal) => {
    if (!(subtotal > 0) || restaurant?.serviceChargeEnabled === false) return 0;
    return Number(restaurant?.serviceChargeAmount ?? 500) || 0;
};

// Guest-facing name. The menu is provided by a partner restaurant whose name is never shown.
export const BRAND_NAME = 'Beyond Heaven Resort';
