import {createClient} from 'redis';

const redis = createClient({
    url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.log('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

if (!redis.isOpen) {
    redis.connect().catch((err) => {
        console.error('Redis Connection Failed:', err);
    });
}

export default redis;
