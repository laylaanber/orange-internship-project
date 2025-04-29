/**
 * Module setup for browser compatibility
 * Include this before other module imports
 */

// Polyfill for older browsers if needed
if (!window.globalThis) {
    window.globalThis = window;
}

// Make D3 globally available to modules that need it
window.d3 = d3;

// Export any global utilities or configurations
export const config = {
    appName: 'Orange Coding Academy Project Management',
    version: '1.0.0'
};