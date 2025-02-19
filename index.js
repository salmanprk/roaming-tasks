import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import express from 'express';
import { handleCRSDrawsUpdate } from './handlers.js';
dotenv.config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Add debounce flag at the top level scope
let isProcessing = false;
let debounceTimer = null;

// Function to listen for real-time changes
const listenForChanges = async () => {
    console.log('Listening for updates on CRSDraws table...');

    supabase
        .channel('crs-draws-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'CRSDraws' }, (payload) => {
            console.log(new Date().toISOString(), 'Change detected');

            if (debounceTimer) {
                console.log(new Date().toISOString(), 'Clearing previous timer');
                clearTimeout(debounceTimer);
            }

            // Remove isProcessing check - we only need it during actual processing
            console.log(new Date().toISOString(), 'Starting new timer...');
            debounceTimer = setTimeout(async () => {
                console.log(new Date().toISOString(), 'Timer finished, starting update...');
                if (!isProcessing) {  // Move the check here
                    isProcessing = true;
                    try {
                        console.log(new Date().toISOString(), 'About to call handleCRSDrawsUpdate');
                        console.log('Payload:', JSON.stringify(payload, null, 2));
                        await handleCRSDrawsUpdate(payload);
                        console.log(new Date().toISOString(), 'Change processed successfully');
                    } catch (error) {
                        console.error(new Date().toISOString(), 'Error processing change:', error);
                        console.error('Error stack:', error.stack);
                    } finally {
                        console.log(new Date().toISOString(), 'Finally block reached');
                        isProcessing = false;
                        debounceTimer = null;
                    }
                }
            }, 45000); // Wait 45 second before processing
            console.log(new Date().toISOString(), `Timer set (ID: ${debounceTimer}), waiting 45 seconds...`);
        })
        .subscribe();
};

// Start listening for changes
listenForChanges();

// Simple API route
app.get('/', (req, res) => {
    res.send('CRSDraws real-time listener is running!');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Process terminated');
    process.exit(0);
});
