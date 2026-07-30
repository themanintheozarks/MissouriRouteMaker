// public/js/bootstrap.js
import { db } from './database.js';
import { placeEditor } from './editor.js';

export async function bootstrapApplication() {
    console.log('Starting bootstrap sequence...');

    try {
        // 1. Initialize Database
        await db.open();
        console.log('Database initialized.');

        // 2. Initialize Settings / Config (placeholder if needed)
        console.log('Settings initialized.');

        // 3. Initialize Map & Markers (placeholder)
        console.log('Map subsystem ready.');

        // 4. Initialize Places subsystem
        console.log('Places subsystem ready.');

        // 5. Initialize GPS subsystem (placeholder)
        console.log('GPS subsystem ready.');

        // 6. Initialize Routes subsystem (placeholder)
        console.log('Routes subsystem ready.');

        // 7. Initialize UI components
        placeEditor.init();
        console.log('UI components initialized.');

        console.log('Bootstrap sequence successfully completed.');
    } catch (error) {
        console.error('Error during application bootstrap:', error);
        throw error;
    }
}
