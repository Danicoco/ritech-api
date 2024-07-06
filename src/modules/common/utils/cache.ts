/** @format */

import cache from "memory-cache"

const memoryCache = new cache.Cache()

class MemoryAppCache {

    constructor() {}

    public add(key: string, value: any) {
        return memoryCache.put(key, JSON.stringify(value))
    }

    public get(key: string) {
        const record = memoryCache.get(key) as string;
        if (!record) return record;
        return JSON.parse(record);
    }

    public delete(key: string) {
        return memoryCache.del(key)
    }
}

export default MemoryAppCache
