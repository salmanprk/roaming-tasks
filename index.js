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

// Function to listen for real-time changes
const listenForChanges = async () => {
    console.log('Listening for updates on CRSDraws table...');

    supabase
        .channel('crs-draws-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'CRSDraws' }, (payload) => {
            console.log(new Date().toISOString(), 'Change detected');
            console.log(payload);
            // Process data, send notifications, etc.
            handleCRSDrawsUpdate(payload);
            console.log(new Date().toISOString(), 'Change processed');
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
