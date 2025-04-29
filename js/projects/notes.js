/**
 * Note management module
 * Handles operations on notes like creation, editing, deletion
 */

import { getCurrentProject, saveProjects } from './data.js';
import { renderSidebarNotes } from './ui.js';
import { openNoteModal } from './modals.js';
import { convertMarkdownToHTML } from './utils.js';

/**
 * Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {Array} tags - Note tags
 * @returns {object|null} The created note or null if creation failed
 */
function createNote(title, content, tags = []) {
    const currentProject = getCurrentProject();
    if (!currentProject) return null;
    
    const newNote = {
        id: 'note_' + Date.now(),
        title: title,
        content: content,
        tags: tags,
        links: [],
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    currentProject.notes.push(newNote);
    saveProjects();
    renderSidebarNotes();
    renderNotes();
    
    return newNote;
}

/**
 * Update an existing note
 * @param {string} noteId - Note ID
 * @param {string} title - New note title
 * @param {string} content - New note content
 * @param {Array} tags - New note tags
 * @returns {object|null} The updated note or null if update failed
 */
function updateNote(noteId, title, content, tags) {
    const currentProject = getCurrentProject();
    if (!currentProject) return null;
    
    let updatedNote = null;
    
    currentProject.notes = currentProject.notes.map(note => {
        if (note.id === noteId) {
            updatedNote = {
                ...note,
                title: title,
                content: content,
                tags: tags,
                lastModified: new Date().toISOString()
            };
            return updatedNote;
        }
        return note;
    });
    
    saveProjects();
    renderSidebarNotes();
    renderNotes();
    
    return updatedNote;
}

/**
 * Delete a note
 * @param {string} noteId - Note ID to delete
 * @returns {boolean} Success status
 */
function deleteNote(noteId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    const initialLength = currentProject.notes.length;
    currentProject.notes = currentProject.notes.filter(note => note.id !== noteId);
    
    if (currentProject.notes.length < initialLength) {
        saveProjects();
        renderSidebarNotes();
        renderNotes();
        return true;
    }
    
    return false;
}

/**
 * View a specific note
 * @param {string} noteId - Note ID to view
 */
function viewNote(noteId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return;
    
    const note = currentProject.notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Hide project board and show note view
    document.getElementById('project-board').style.display = 'none';
    document.getElementById('no-project-view').style.display = 'none';
    
    const noteViewContainer = document.getElementById('note-view-container');
    noteViewContainer.style.display = 'flex';
    
    // Update note content
    document.getElementById('note-view-title').textContent = note.title;
    document.getElementById('note-view-content').innerHTML = convertMarkdownToHTML(note.content);
    
    // Update note tags
    const tagsContainer = document.getElementById('note-view-tags');
    tagsContainer.innerHTML = '';
    
    if (note.tags && note.tags.length) {
        note.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
    }
    
    // Set up edit and delete buttons
    document.getElementById('edit-note-btn').onclick = () => openNoteModal(note);
    document.getElementById('delete-note-btn').onclick = () => {
        if (confirm('Delete this note?')) {
            deleteNote(note.id);
            showProjectBoard();
        }
    };
    
    // Update active state in sidebar
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-id') === noteId) {
            item.classList.add('active');
        }
    });
}

/**
 * Show project board (hide note view)
 */
function showProjectBoard() {
    const currentProject = getCurrentProject();
    
    if (currentProject) {
        document.getElementById('project-board').style.display = 'flex';
        document.getElementById('no-project-view').style.display = 'none';
        document.getElementById('note-view-container').style.display = 'none';
        
        // Deactivate all note items
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
    } else {
        document.getElementById('project-board').style.display = 'none';
        document.getElementById('no-project-view').style.display = 'flex';
        document.getElementById('note-view-container').style.display = 'none';
    }
}

/**
 * Render notes in the main content area
 */
function renderNotes() {
    const currentProject = getCurrentProject();
    if (!currentProject || !currentProject.notes) return;
    
    // Check if notes section exists, create if not
    let notesSection = document.querySelector('.notes-section');
    if (!notesSection) {
        notesSection = document.createElement('div');
        notesSection.className = 'notes-section';
        notesSection.innerHTML = '<h3>Project Notes</h3>';
        document.querySelector('.board-content').appendChild(notesSection);
    }
    
    // Clear existing notes
    const notesContainer = notesSection.querySelector('.notes-container') || document.createElement('div');
    notesContainer.className = 'notes-container';
    notesContainer.innerHTML = '';
    
    // Add notes
    currentProject.notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.innerHTML = `
            <div class="note-header">
                <h4>${note.title}</h4>
                <div class="note-actions">
                    <button class="edit-note" data-id="${note.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-note" data-id="${note.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="note-content">${convertMarkdownToHTML(note.content)}</div>
            ${note.tags && note.tags.length ? `
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        `;
        
        // Add event listeners for edit/delete buttons
        noteElement.querySelector('.edit-note').addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteModal(note);
        });
        
        noteElement.querySelector('.delete-note').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this note?')) {
                deleteNote(note.id);
            }
        });
        
        notesContainer.appendChild(noteElement);
    });
    
    // Add notes container if it doesn't exist
    if (!notesSection.querySelector('.notes-container')) {
        notesSection.appendChild(notesContainer);
    }
}

// Export functions
export {
    createNote,
    updateNote,
    deleteNote,
    viewNote,
    showProjectBoard,
    renderNotes
};