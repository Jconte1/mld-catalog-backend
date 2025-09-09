import { getRedis } from '../../../lib/redis/client.js';
import { createHash } from 'node:crypto';

export const TTL_PRODUCT = 60 * 60;      // 60 min
export const TTL_FILTERS = 2 * 60 * 60;  // 2 hours
export const TTL_LIST = 10 * 60;      // 10 min

export async function redisGet(key) {
    try {
        const r = await getRedis();
        return await r.get(key);
    } catch {
        return null;
    }
}
export async function redisSetEx(key, seconds, value) {
    try {
        const r = await getRedis();
        await r.set(key, value, {
            EX: seconds
        });
        
    } catch { }
}

export async function getTypeVersion(type) {
    try {
        const r = await getRedis();
        const v = await r.get(`v:products:${type}`);
        return v || '1';
    } catch { return '1'; }
}

export function canonicalizeFilters(raw) {
    let obj = {};
    try { obj = typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); } catch { obj = {}; }

    const normalizeArr = (arr) =>
        Array.isArray(arr)
            ? arr
                .map(v => (typeof v === 'string' ? v.trim().toLowerCase() : v))
                .filter(v => v && String(v).length > 0)
                .sort()
            : undefined;

    const canon = {};
    if (obj.features) canon.features = normalizeArr(obj.features);
    if (obj.brand) canon.brand = normalizeArr(obj.brand);
    if (obj.width) canon.width = normalizeArr(obj.width);
    if (obj.fueltype) canon.fueltype = normalizeArr(obj.fueltype);
    if (obj.configuration) canon.configuration = normalizeArr(obj.configuration);
    if (obj.producttype) canon.producttype = normalizeArr(obj.producttype);

    Object.keys(canon).forEach(k => { if (!canon[k] || canon[k].length === 0) delete canon[k]; });

    const json = JSON.stringify(canon);
    const hash = createHash('sha1').update(json).digest('hex').slice(0, 16);
    return { canon, hash };
}
