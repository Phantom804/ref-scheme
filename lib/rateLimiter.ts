import type { NextRequest } from 'next/server';
import redis from './redis';

interface RateLimitConfig {
    windowSec: number;
    max: number;
}

export async function rateLimiter(
    req: NextRequest,
    keyPrefix: string,
    config: RateLimitConfig
) {

    const getClientIp = (req: NextRequest): string => {
        return (
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip')?.trim() ||
            'unknown'
        );
    };

    const ip = getClientIp(req);
    const key = `${keyPrefix}_${ip}`;
    const { windowSec, max } = config;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSec);
        }

        const ttl = await redis.ttl(key);
        const success = count <= max;

        return {
            success,
            retryAfter: ttl,
            remaining: Math.max(0, max - count),
        };
    } catch (error) {
        console.error('Rate limiter error:', error);
        return {
            success: true,
            retryAfter: 0,
            remaining: max,
        };
    }
}
