import Fastify from 'fastify';
import { log } from './utils/logger.js';
import { initializeRedisListener, publisher, eventsChannel } from './events.js';
import { supabaseListener } from './supabaseListener.js';

export const app = Fastify();

// Add environment logging at startup
log.info(`Environment: ${process.env.NODE_ENV}`);


// Test publish endpoint
app.get('/publish', async (request, reply) => {
    log.info("Message to publish:", request.query.msg);
    const msg = request.query.msg;
    try {
        await publisher.publish(eventsChannel, msg);
        log.success('[PUBLISHER] Message published to Redis');
        return reply.status(200).send({ status: 'Message published to Redis' });
    } catch (error) {
        log.error('[PUBLISHER] Failed to publish to Redis:', error);
        return reply.status(500).send({ status: 'Failed to publish message' });
    }
});

// Root route - just to confirm service is running
app.get('/', async (request, res) => {
    app.log.info("Webhook is responding to health check")
    return res.status(200).send({ status: 'CRSDraws real-time listener is running!' });
});


// Start the server
const start = async () => {
    try {
        await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
        log.success(`Server is running on port ${app.server.address().port}`);

        // Start both listeners
        await supabaseListener();
        await initializeRedisListener();
    } catch (err) {
        log.error('Error starting server:', err);
        process.exit(1);
    }
};

// Handle graceful shutdown
const closeGracefully = async (signal) => {
    app.log.warn(`Received signal to terminate: ${signal}`);
    await app.close();
    process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

start();

