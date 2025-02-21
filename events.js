import Redis from 'ioredis';
export const subscriber = new Redis(process.env.REDIS_URL);
export const publisher = new Redis(process.env.REDIS_URL);
export const eventsChannel = 'first-channel';
import { log } from './utils/logger.js';




export const initializeRedisListener = async () => {
    log.info('[SUBSCRIBER] Setting up Redis subscriber...');

    subscriber.subscribe(eventsChannel, (err, count) => {
        if (err) {
            log.error('[SUBSCRIBER] Failed to subscribe to Redis:', err.message);
        } else {
            log.info(`[SUBSCRIBER] Subscribed successfully to Redis! Channel count: ${count}`);
        }
    });

    subscriber.on('message', (channel, message) => {
        console.log("Channel: ", channel);
        console.log("Message: ", message);

        // 
        if (message === 'new_draw') {
            log.success('[SUBSCRIBER] New draw event:', message);
        }
        if (message === 'update_draw') {
            log.success('[SUBSCRIBER] Update draw event:', message);
        }
        if (message === 'yo') {
            log.success('[SUBSCRIBER] Yo event:', message);
        }
    });

    subscriber.on('error', (err) => {
        log.error('[SUBSCRIBER] Redis subscription error:', err);
    });

};