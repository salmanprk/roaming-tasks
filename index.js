import Fastify from 'fastify';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { handleCRSDrawsUpdate } from './handlers.js';
import { format } from 'date-fns';
import { log, ts } from './utils/logger.js';
// Initialize environment variables
dotenv.config();

const app = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                // translateTime: 'SYS:standard'
            }
        }
    }
});

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Single timer and flag for all changes
let debounceTimer = null;
let isProcessing = false;

// Root route - just to confirm service is running
app.get('/', async (request, reply) => {
    return { status: 'CRSDraws real-time listener is running!' };
});
// Function to handle changes (your existing code)
function handleBalancer(payload) {
    app.log.info('Change detected');

    if (debounceTimer) {
        app.log.info('Clearing previous timer');
        clearTimeout(debounceTimer);
    }

    app.log.info('Starting new timer...');
    debounceTimer = setTimeout(async () => {
        app.log.info('Timer finished, starting update...');
        if (!isProcessing) {
            isProcessing = true;
            try {
                log.info('Before calling handlers');
                await handleCRSDrawsUpdate(payload);
                log.success('Change processed successfully');
            } catch (error) {
                log.error('Error processing change:', error);
            } finally {
                log.info('Resetting flags');
                isProcessing = false;
                debounceTimer = null;
            }
        }
    }, 10000);

    app.log.info(`Timer set (ID: ${debounceTimer}), waiting 10 seconds...`);
}

// Function to listen for changes
const listenForChanges = async () => {
    console.log('Listening for updates on CRSDraws table...');

    supabase
        .channel('crs-draws-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'CRSDraws' }, handleBalancer)
        .subscribe();
};

// Start the server
const start = async () => {
    try {
        await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
        log.info(`Server is running on port ${app.server.address().port}`);

        // Start listening for Supabase changes
        await listenForChanges();
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

