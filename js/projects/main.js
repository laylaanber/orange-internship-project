/**
 * Orange Coding Academy Project Management System - Main Entry
 * Coordinates all modules and initializes the application
 */

// Import from setup script first
import { config } from './setup.js';

// Import compatibility script
import './compat.js';

// Import all required modules
import { checkAuth } from '../auth.js';
import { loadProjects, getCurrentProject, getAllProjects } from './data.js';
import { renderProjects, renderLists, setupEventListeners, updateDashboardStats } from './ui.js';
import { initModals } from './modals.js';
import { initGraphView } from './graph.js';

// Log application startup
console.log(`Starting ${config.appName} v${config.version}`);

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (checkAuth()) {
        console.log('User authenticated, loading data...');
        
        // Load user data and projects
        loadProjects();
        
        // Render the UI
        renderProjects();
        
        // Initialize all components
        initModals();
        initGraphView();
        setupEventListeners();
        
        // Update statistics
        updateDashboardStats();
        
        console.log('Application initialization complete');
    } else {
        console.warn('Authentication failed, redirecting to login...');
    }
});

// Export relevant functions for other modules
export {
    getCurrentProject
};