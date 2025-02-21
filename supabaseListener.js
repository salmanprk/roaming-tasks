import { createClient } from '@supabase/supabase-js';
import { log } from './utils/logger.js';
import { handleCRSDrawsUpdate } from './handlers.js';
import { app } from './app.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
// Single timer and flag for all changes
let debounceTimer = null;
let isProcessing = false;

// Function to handle changes (your existing code)
function handleBalancer(payload) {
    log.info('Change detected');

    if (debounceTimer) {
        log.info('Clearing previous timer');
        clearTimeout(debounceTimer);
    }

    app.log.info('Starting new timer...');
    debounceTimer = setTimeout(async () => {
        log.info('Timer finished, starting update...');
        if (!isProcessing) {
            isProcessing = true;
            try {
                log.info('Before calling handlers');
                // TODO: Add logic to handle the Supabase payload
                const update = await handleCRSDrawsUpdate(payload);
                // END TODO 
                log.success('Change processed successfully');
                log.success(update);
            } catch (error) {
                log.error('Error processing change:', error);
            } finally {
                log.info('Resetting flags');
                isProcessing = false;
                debounceTimer = null;
            }
        }
    }, 10000);

    log.info(`Timer set (ID: ${debounceTimer}), waiting 10 seconds...`);
}

export const supabaseListener = async () => {
    log.info('Listening for updates on CRSDraws table...');
    // Log environment variables using custom logger
    log.info('SUPABASE_URL:', process.env.SUPABASE_URL);
    log.info('SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + '...');  // Only show part of the key for security

    supabase
        .channel('crs-draws-updates')
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'CRSDraws'
            },
            handleBalancer
        )
        .subscribe((status) => {
            log.info(`Supabase subscription status: ${status}`);
        });
};