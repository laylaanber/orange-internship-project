/**
 * Modal management module
 * Handles opening, closing, and interactions with modals
 */

import { getCurrentProject, createProject, updateProject, saveProjects } from './data.js';
import { renderProjects, renderLists } from './ui.js';
import { createList } from './lists.js';
import { createCard, updateCard } from './cards.js';
import { createNote, updateNote } from './notes.js';
import { updateMarkdownPreview, updateNotePreview } from './utils.js';

// Modal state variables
let editingProjectId = null;
let editingCardId = null;
let editingNoteId = null;
let currentList = null;

// DOM elements
const projectModal = document.getElementById('project-modal');
const listModal = document.getElementById('list-modal');
const cardModal = document.getElementById('card-modal');
const noteModal = document.getElementById('note-modal');
const projectForm = document.getElementById('project-form');
const listForm = document.getElementById('list-form');
const cardForm = document.getElementById('card-form');
const noteForm = document.getElementById('note-form');
const modalTitle = document.getElementById('modal-title');

// Form inputs
const projectNameInput = document.getElementById('project-name');
const projectDescInput = document.getElementById('project-description');
const listNameInput = document.getElementById('list-name');
const cardTitleInput = document.getElementById('card-title');
const cardDescInput = document.getElementById('card-description');
const cardDueDateInput = document.getElementById('card-due-date');
const cardPriorityInput = document.getElementById('card-priority');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');

/**
 * Initialize modal events
 */
function initModals() {
    // Setup modal forms
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    if (listForm) {
        listForm.addEventListener('submit', handleListSubmit);
    }
    
    if (cardForm) {
        cardForm.addEventListener('submit', handleCardSubmit);
    }
    
    if (noteForm) {
        noteForm.addEventListener('submit', handleNoteSubmit);
    }
    
    // Setup close buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    const cancelModalButtons = document.querySelectorAll('.cancel-modal');
    cancelModalButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Setup click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === projectModal || e.target === listModal || 
            e.target === cardModal || e.target === noteModal) {
            closeModals();
        }
    });
    
    // Markdown previews
    if (cardDescInput) {
        cardDescInput.addEventListener('input', updateMarkdownPreview);
    }
    
    if (noteContentInput) {
        noteContentInput.addEventListener('input', updateNotePreview);
    }
}

/**
 * Handle project form submission
 * @param {Event} e - Submit event
 */
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const name = projectNameInput.value.trim();
    const description = projectDescInput.value.trim();
    
    if (editingProjectId) {
        updateProject(editingProjectId, name, description);
    } else {
        createProject(name, description);
    }
    
    closeModals();
}

/**
 * Handle list form submission
 * @param {Event} e - Submit event
 */
function handleListSubmit(e) {
    e.preventDefault();
    
    const name = listNameInput.value.trim();
    createList(name);
    
    closeModals();
}

/**
 * Handle card form submission
 * @param {Event} e - Submit event
 */
function handleCardSubmit(e) {
    e.preventDefault();
    
    const title = cardTitleInput.value.trim();
    const description = cardDescInput.value.trim();
    const dueDate = cardDueDateInput.value || null;
    const priority = cardPriorityInput.value;
    
    // Get tags if available
    const tags = [];
    const cardTagsInput = document.getElementById('card-tags');
    if (cardTagsInput && cardTagsInput.value) {
        try {
            tags.push(...JSON.parse(cardTagsInput.value));
        } catch (err) {
            console.error('Error parsing tags:', err);
        }
    }
    
    // Get completion status if available
    const completionCheckbox = document.getElementById('card-completed');
    const completed = completionCheckbox ? completionCheckbox.checked : false;
    
    if (editingCardId && currentList) {
        updateCard(currentList.id, editingCardId, {
            title,
            description,
            dueDate,
            priority,
            tags,
            completed
        });
    } else if (currentList) {
        createCard(currentList.id, title, description, dueDate, priority, tags);
    }
    
    closeModals();
}

/**
 * Handle note form submission
 * @param {Event} e - Submit event
 */
function handleNoteSubmit(e) {
    e.preventDefault();
    
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    // Get tags if available
    const tags = [];
    const noteTagsInput = document.getElementById('note-tags');
    if (noteTagsInput && noteTagsInput.value) {
        try {
            tags.push(...JSON.parse(noteTagsInput.value));
        } catch (err) {
            console.error('Error parsing note tags:', err);
        }
    }
    
    if (editingNoteId) {
        updateNote(editingNoteId, title, content, tags);
    } else {
        createNote(title, content, tags);
    }
    
    closeModals();
}

/**
 * Open project creation/editing modal
 * @param {object} project - Project to edit (optional)
 */
function openProjectModal(project = null) {
    if (project) {
        editingProjectId = project.id;
        projectNameInput.value = project.name;
        projectDescInput.value = project.description || '';
        
        modalTitle.textContent = 'Edit Project';
        document.querySelector('#project-form .btn-primary').textContent = 'Save Changes';
    } else {
        editingProjectId = null;
        projectForm.reset();
        
        modalTitle.textContent = 'Create New Project';
        document.querySelector('#project-form .btn-primary').textContent = 'Create Project';
    }
    
    projectModal.classList.add('active');
    projectNameInput.focus();
}

/**
 * Open list creation modal
 */
function openListModal() {
    listForm.reset();
    listModal.classList.add('active');
    listNameInput.focus();
}

/**
 * Open card creation/editing modal
 * @param {string} listId - List ID
 * @param {object} card - Card to edit (optional)
 */
function openCardModal(listId, card = null) {
    const currentProject = getCurrentProject();
    currentList = currentProject ? currentProject.lists.find(list => list.id === listId) : null;
    
    if (!currentList) return;
    
    if (card) {
        editingCardId = card.id;
        cardTitleInput.value = card.title;
        cardDescInput.value = card.description || '';
        cardDueDateInput.value = card.dueDate || '';
        cardPriorityInput.value = card.priority || 'medium';
        
        // Handle completion status
        const completionCheckbox = document.getElementById('card-completed');
        if (completionCheckbox) {
            completionCheckbox.checked = card.completed || false;
        }
        
        // Handle tags
        const tagsContainer = document.getElementById('tags-container');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            if (card.tags && card.tags.length) {
                card.tags.forEach(tag => addTag(tag));
            }
        }
        
        document.querySelector('#card-modal .modal-header h3').textContent = 'Edit Card';
        document.querySelector('#card-form .btn-primary').textContent = 'Save Changes';
    } else {
        editingCardId = null;
        cardForm.reset();
        
        // Reset tags
        const tagsContainer = document.getElementById('tags-container');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }
        
        // Reset completion checkbox
        const completionCheckbox = document.getElementById('card-completed');
        if (completionCheckbox) {
            completionCheckbox.checked = false;
        }
        
        document.querySelector('#card-modal .modal-header h3').textContent = 'Add New Card';
        document.querySelector('#card-form .btn-primary').textContent = 'Add Card';
    }
    
    cardModal.classList.add('active');
    cardTitleInput.focus();
    
    // Update markdown preview
    if (cardDescInput) {
        updateMarkdownPreview();
    }
}

/**
 * Open note creation/editing modal
 * @param {object} note - Note to edit (optional)
 */
function openNoteModal(note = null) {
    if (!getCurrentProject()) return;
    
    if (note) {
        editingNoteId = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content || '';
        
        // Clear tags and add existing ones
        const noteTagsContainer = document.getElementById('note-tags-container');
        if (noteTagsContainer) {
            noteTagsContainer.innerHTML = '';
            if (note.tags && note.tags.length) {
                note.tags.forEach(tag => addNoteTag(tag));
            }
        }
        
        document.getElementById('note-modal-title').textContent = 'Edit Note';
        document.querySelector('#note-form .btn-primary').textContent = 'Save Changes';
    } else {
        editingNoteId = null;
        noteForm.reset();
        
        // Clear tags
        const noteTagsContainer = document.getElementById('note-tags-container');
        if (noteTagsContainer) {
            noteTagsContainer.innerHTML = '';
        }
        
        document.getElementById('note-modal-title').textContent = 'Create New Note';
        document.querySelector('#note-form .btn-primary').textContent = 'Create Note';
    }
    
    noteModal.classList.add('active');
    noteTitleInput.focus();
    
    // Initialize preview
    if (noteContentInput) {
        updateNotePreview();
    }
}

/**
 * Close all modals
 */
function closeModals() {
    projectModal.classList.remove('active');
    listModal.classList.remove('active');
    cardModal.classList.remove('active');
    noteModal.classList.remove('active');
    
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
        profileModal.classList.remove('active');
    }
    
    editingProjectId = null;
    editingCardId = null;
    editingNoteId = null;
    currentList = null;
}

/**
 * Add a tag to a card
 * @param {string} tagName - Tag name
 */
function addTag(tagName) {
    const tagsContainer = document.getElementById('tags-container');
    const cardTagsInput = document.getElementById('card-tags');
    
    if (!tagsContainer || !cardTagsInput) return;
    
    // Create tag element
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `
        ${tagName}
        <span class="remove">&times;</span>
    `;
    
    // Add remove functionality
    tag.querySelector('.remove').addEventListener('click', () => {
        tag.remove();
        updateTagsInput();
    });
    
    // Add to container
    tagsContainer.appendChild(tag);
    
    // Update hidden input
    updateTagsInput();
}

/**
 * Add a tag to a note
 * @param {string} tagName - Tag name
 */
function addNoteTag(tagName) {
    const noteTagsContainer = document.getElementById('note-tags-container');
    const noteTagsInput = document.getElementById('note-tags');
    
    if (!noteTagsContainer || !noteTagsInput) return;
    
    // Create tag element
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `
        ${tagName}
        <span class="remove">&times;</span>
    `;
    
    // Add remove functionality
    tag.querySelector('.remove').addEventListener('click', () => {
        tag.remove();
        updateNoteTagsInput();
    });
    
    // Add to container
    noteTagsContainer.appendChild(tag);
    
    // Update hidden input
    updateNoteTagsInput();
}

/**
 * Update the hidden tags input for cards
 */
function updateTagsInput() {
    const tagsContainer = document.getElementById('tags-container');
    const cardTagsInput = document.getElementById('card-tags');
    
    if (!tagsContainer || !cardTagsInput) return;
    
    const tags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => {
        return tag.textContent.trim();
    });
    
    cardTagsInput.value = JSON.stringify(tags);
}

/**
 * Update the hidden tags input for notes
 */
function updateNoteTagsInput() {
    const noteTagsContainer = document.getElementById('note-tags-container');
    const noteTagsInput = document.getElementById('note-tags');
    
    if (!noteTagsContainer || !noteTagsInput) return;
    
    const tags = Array.from(noteTagsContainer.querySelectorAll('.tag')).map(tag => {
        return tag.textContent.trim();
    });
    
    noteTagsInput.value = JSON.stringify(tags);
}

// Export functions
export {
    initModals,
    openProjectModal,
    openListModal,
    openCardModal,
    openNoteModal,
    closeModals,
    addTag,
    addNoteTag
};