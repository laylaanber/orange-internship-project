/**
 * Compatibility layer for global functions
 * Exposes module functions to global scope for legacy code
 */

import { logout, checkAuth, getCurrentUser } from '../auth.js';
import { createProject, updateProject, deleteProject, selectProject } from './data.js';
import { renderProjects, renderLists } from './ui.js';
import { openProjectModal, openListModal, openCardModal, openNoteModal } from './modals.js';
import { createCard, updateCard, deleteCard, toggleCardCompletion } from './cards.js';
import { createNote, updateNote, deleteNote } from './notes.js';

// Expose functions to global scope
Object.assign(window, {
    // Auth functions
    logout,
    checkAuth,
    getCurrentUser,
    
    // Project functions
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    
    // UI functions
    renderProjects,
    renderLists,
    
    // Modal functions
    openProjectModal,
    openListModal,
    openCardModal,
    openNoteModal,
    
    // Card functions
    createCard,
    updateCard,
    deleteCard,
    toggleCardCompletion,
    
    // Note functions
    createNote,
    updateNote,
    deleteNote
});

console.log('Compatibility layer initialized');