/**
 * Orange Coding Academy Project Management System
 * Trello-like interface for managing projects and tasks
 */

// ==============================================
// DOM ELEMENTS
// ==============================================
const projectList = document.getElementById('project-list');
const projectTitle = document.getElementById('project-title');
const newProjectBtn = document.getElementById('new-project-btn');
const createFirstProjectBtn = document.getElementById('create-first-project');
const editProjectBtn = document.getElementById('edit-project-btn');
const deleteProjectBtn = document.getElementById('delete-project-btn');
const noProjectView = document.getElementById('no-project-view');
const projectBoard = document.getElementById('project-board');
const listsContainer = document.getElementById('lists-container');
const addListBtn = document.getElementById('add-list-btn');

// Modal elements
const projectModal = document.getElementById('project-modal');
const listModal = document.getElementById('list-modal');
const cardModal = document.getElementById('card-modal');
const projectForm = document.getElementById('project-form');
const listForm = document.getElementById('list-form');
const cardForm = document.getElementById('card-form');
const modalTitle = document.getElementById('modal-title');
const closeModalButtons = document.querySelectorAll('.close-modal');
const cancelModalButtons = document.querySelectorAll('.cancel-modal');

// Form fields
const projectNameInput = document.getElementById('project-name');
const projectDescInput = document.getElementById('project-description');
const listNameInput = document.getElementById('list-name');
const cardTitleInput = document.getElementById('card-title');
const cardDescInput = document.getElementById('card-description');
const cardDueDateInput = document.getElementById('card-due-date');
const cardPriorityInput = document.getElementById('card-priority');

// Additional DOM elements for new features
const graphViewBtn = document.getElementById('graph-view-btn');
const graphView = document.getElementById('graph-view');
const graphContent = document.getElementById('graph-content');
const graphProjectName = document.getElementById('graph-project-name');
const previewContent = document.getElementById('preview-content');
const markdownToolbar = document.querySelector('.markdown-editor .toolbar');
const tagInput = document.getElementById('tag-input');
const tagsContainer = document.getElementById('tags-container');
const cardTagsInput = document.getElementById('card-tags');

// Note modal elements
const noteModal = document.getElementById('note-modal');
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const noteTagInput = document.getElementById('note-tag-input');
const noteTagsContainer = document.getElementById('note-tags-container');
const noteTagsInput = document.getElementById('note-tags');
const noteModalTitle = document.getElementById('note-modal-title');
const notePreviewContent = document.getElementById('note-preview-content');

// Sidebar elements
const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
const mainSidebar = document.querySelector('.main-sidebar');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarCurrentDate = document.getElementById('sidebar-current-date');
const noteList = document.getElementById('sidebar-note-list');

// Profile and logout elements
const profileBtn = document.getElementById('profile-btn');
const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

// ==============================================
// APPLICATION STATE
// ==============================================
let currentUser = null;
let projects = [];
let currentProject = null;
let currentList = null;
let editingProjectId = null;
let editingCardId = null;
let editingNoteId = null;

// ==============================================
// EVENT LISTENERS
// ==============================================

// Project management
newProjectBtn.addEventListener('click', () => openProjectModal());
createFirstProjectBtn.addEventListener('click', () => openProjectModal());
editProjectBtn.addEventListener('click', () => {
    if (currentProject) openProjectModal(currentProject);
});
deleteProjectBtn.addEventListener('click', () => {
    if (currentProject && confirm('Are you sure you want to delete this project?')) {
        deleteProject(currentProject.id);
    }
});

// Project modal form
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = projectNameInput.value.trim();
    const description = projectDescInput.value.trim();
    
    if (editingProjectId) {
        updateProject(editingProjectId, name, description);
    } else {
        createProject(name, description);
    }
    
    closeModals();
});

// List management
addListBtn.addEventListener('click', () => openListModal());
listForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = listNameInput.value.trim();
    createList(name);
    
    closeModals();
});

// Card form
cardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = cardTitleInput.value.trim();
    const description = cardDescInput.value.trim();
    const dueDate = cardDueDateInput.value || null;
    const priority = cardPriorityInput.value;
    
    if (editingCardId) {
        updateCard(editingCardId, title, description, dueDate, priority);
    } else {
        createCard(currentList.id, title, description, dueDate, priority);
    }
    
    closeModals();
});

// Note form submission
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const tags = noteTagsInput && noteTagsInput.value ? 
                 JSON.parse(noteTagsInput.value) : [];
    
    if (editingNoteId) {
        updateNote(editingNoteId, title, content, tags);
    } else {
        createNote(title, content, tags);
    }
    
    closeModals();
});

// Handle note tags input
if (noteTagInput) {
    noteTagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && noteTagInput.value.trim()) {
            e.preventDefault();
            addNoteTag(noteTagInput.value.trim());
            noteTagInput.value = '';
        }
    });
}

// Update preview when editing note
if (noteContentInput) {
    noteContentInput.addEventListener('input', updateNotePreview);
}

// Close modals
closeModalButtons.forEach(btn => {
    btn.addEventListener('click', closeModals);
});

cancelModalButtons.forEach(btn => {
    btn.addEventListener('click', closeModals);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === projectModal || e.target === listModal || e.target === cardModal || e.target === noteModal) {
        closeModals();
    }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        
        // Animate hamburger to X
        const spans = menuToggle.querySelectorAll('span');
        if (spans.length === 3) {
            spans[0].classList.toggle('rotate-down');
            spans[1].classList.toggle('fade-out');
            spans[2].classList.toggle('rotate-up');
        }
    });
}

// Graph view button
graphViewBtn.addEventListener('click', openKnowledgeGraph);
document.querySelector('.close-graph').addEventListener('click', () => {
    graphView.classList.remove('active');
});

// Handle markdown toolbar actions
if (markdownToolbar) {
    markdownToolbar.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
            const button = e.target.closest('button');
            const action = button.getAttribute('data-action');
            handleMarkdownAction(action);
        }
    });
}

// Live markdown preview
if (cardDescInput) {
    cardDescInput.addEventListener('input', updateMarkdownPreview);
}

// Handle tags input
if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && tagInput.value.trim()) {
            e.preventDefault();
            addTag(tagInput.value.trim());
            tagInput.value = '';
        }
    });
}

// Sidebar collapse functionality
if (sidebarCollapseBtn && mainSidebar) {
    sidebarCollapseBtn.addEventListener('click', function() {
        mainSidebar.classList.toggle('collapsed');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadUserData();
        renderProjects();
        updateUserUI();
    }
});

// ==============================================
// PROJECT MANAGEMENT FUNCTIONS
// ==============================================

// Create a new project
function createProject(name, description) {
    const newProject = {
        id: Date.now().toString(),
        name: name,
        description: description || '',
        lists: [
            {
                id: 'list_' + Date.now() + '_1',
                name: 'To Do',
                cards: []
            },
            {
                id: 'list_' + Date.now() + '_2',
                name: 'In Progress',
                cards: []
            },
            {
                id: 'list_' + Date.now() + '_3',
                name: 'Done',
                cards: []
            }
        ],
        notes: [], // Add support for standalone notes (Obsidian-style)
        connections: [], // Track connections between cards/notes
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    projects.push(newProject);
    saveProjects();
    renderProjects();
    
    // Select the new project
    selectProject(newProject.id);
}

// Update an existing project
function updateProject(projectId, name, description) {
    projects = projects.map(project => {
        if (project.id === projectId) {
            return {
                ...project,
                name: name,
                description: description || ''
            };
        }
        return project;
    });
    
    saveProjects();
    renderProjects();
    
    // Re-select the current project to update UI
    if (currentProject && currentProject.id === projectId) {
        selectProject(projectId);
    }
}

// Delete a project
function deleteProject(projectId) {
    projects = projects.filter(project => project.id !== projectId);
    
    saveProjects();
    renderProjects();
    
    // Clear current project
    currentProject = null;
    showNoProjectView();
}

// Select a project to display
function selectProject(projectId) {
    currentProject = projects.find(project => project.id === projectId);
    
    if (currentProject) {
        // Update UI
        projectTitle.textContent = currentProject.name;
        
        // Show project board
        showProjectBoard();
        
        // Update active project in sidebar
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-id') === projectId) {
                item.classList.add('active');
            }
        });
        
        // Render project lists and sidebar notes
        renderLists();
        renderSidebarNotes();
    }
}

// ==============================================
// LIST MANAGEMENT FUNCTIONS
// ==============================================

// Create a new list in the current project
function createList(name) {
    if (!currentProject) return;
    
    const newList = {
        id: 'list_' + Date.now(),
        name: name,
        cards: []
    };
    
    currentProject.lists.push(newList);
    saveProjects();
    renderLists();
}

// Delete a list
function deleteList(listId) {
    if (!currentProject) return;
    
    currentProject.lists = currentProject.lists.filter(list => list.id !== listId);
    saveProjects();
    renderLists();
}

// ==============================================
// CARD MANAGEMENT FUNCTIONS
// ==============================================

// Open card creation modal
function openCardModal(listId, card = null) {
    currentList = currentProject.lists.find(list => list.id === listId);
    
    if (!currentList) return;
    
    if (card) {
        // Edit existing card
        editingCardId = card.id;
        cardTitleInput.value = card.title;
        cardDescInput.value = card.description || '';
        cardDueDateInput.value = card.dueDate || '';
        cardPriorityInput.value = card.priority || 'medium';
        
        // Handle completion status if editing the form
        const completionCheckbox = document.getElementById('card-completed');
        if (completionCheckbox) {
            completionCheckbox.checked = card.completed || false;
        }
        
        // Clear tags and add existing ones
        tagsContainer.innerHTML = '';
        if (card.tags && card.tags.length) {
            card.tags.forEach(tag => addTag(tag));
        }
        
        document.querySelector('#card-modal .modal-header h3').textContent = 'Edit Card';
        document.querySelector('#card-form .btn-primary').textContent = 'Save Changes';
    } else {
        // New card
        editingCardId = null;
        cardForm.reset();
        tagsContainer.innerHTML = '';
        
        // Reset completion status if creating new card
        const completionCheckbox = document.getElementById('card-completed');
        if (completionCheckbox) {
            completionCheckbox.checked = false;
        }
        
        document.querySelector('#card-modal .modal-header h3').textContent = 'Add New Card';
        document.querySelector('#card-form .btn-primary').textContent = 'Add Card';
    }
    
    cardModal.classList.add('active');
    cardTitleInput.focus();
}

// Update the createCard function
function createCard(listId, title, description, dueDate, priority) {
    const tags = cardTagsInput && cardTagsInput.value ? 
                JSON.parse(cardTagsInput.value) : [];
                
    if (!currentProject) return;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return;
    
    const newCard = {
        id: 'card_' + Date.now(),
        title: title,
        description: description || '',
        dueDate: dueDate,
        priority: priority || 'medium',
        tags: tags,
        links: [],
        completed: false, // Add completed property
        created: new Date().toISOString()
    };
    
    list.cards.push(newCard);
    saveProjects();
    renderLists();
}

// Update an existing card
function updateCard(cardId, title, description, dueDate, priority) {
    if (!currentProject || !currentList) return;
    
    // Get completion status from checkbox
    const completionCheckbox = document.getElementById('card-completed');
    const isCompleted = completionCheckbox ? completionCheckbox.checked : false;
    
    currentList.cards = currentList.cards.map(card => {
        if (card.id === cardId) {
            return {
                ...card,
                title: title,
                description: description || '',
                dueDate: dueDate,
                priority: priority,
                completed: isCompleted
            };
        }
        return card;
    });
    
    saveProjects();
    renderLists();
}

// Delete a card
function deleteCard(listId, cardId) {
    if (!currentProject) return;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return;
    
    list.cards = list.cards.filter(card => card.id !== cardId);
    saveProjects();
    renderLists();
}

// Move a card to another list
function moveCard(cardId, sourceListId, targetListId) {
    if (!currentProject) return;
    
    const sourceList = currentProject.lists.find(list => list.id === sourceListId);
    const targetList = currentProject.lists.find(list => list.id === targetListId);
    
    if (!sourceList || !targetList) return;
    
    const cardIndex = sourceList.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    // Remove from source list and add to target list
    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    targetList.cards.push(movedCard);
    
    saveProjects();
    renderLists();
}

// Toggle card completion status
function toggleCardCompletion(cardId, listId) {
    if (!currentProject) return;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return;
    
    list.cards = list.cards.map(card => {
        if (card.id === cardId) {
            return {
                ...card,
                completed: !card.completed
            };
        }
        return card;
    });
    
    saveProjects();
    renderLists();
    updateDashboardStats(); // Update stats to reflect completion
}

// ==============================================
// NOTE MANAGEMENT FUNCTIONS
// ==============================================

// Function to create standalone notes
function createNote(title, content, tags = []) {
    if (!currentProject) return;
    
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
}

// Update an existing note
function updateNote(noteId, title, content, tags) {
    if (!currentProject) return;
    
    currentProject.notes = currentProject.notes.map(note => {
        if (note.id === noteId) {
            return {
                ...note,
                title: title,
                content: content,
                tags: tags,
                lastModified: new Date().toISOString()
            };
        }
        return note;
    });
    
    saveProjects();
    renderSidebarNotes();
    renderNotes();
}

// Delete a note
function deleteNote(noteId) {
    if (!currentProject) return;
    
    currentProject.notes = currentProject.notes.filter(note => note.id !== noteId);
    saveProjects();
    renderSidebarNotes();
    renderNotes();
}

// Render notes in a dedicated section
function renderNotes() {
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

// Render notes in the sidebar
function renderSidebarNotes() {
    if (!noteList || !currentProject || !currentProject.notes) return;
    
    noteList.innerHTML = '';
    
    if (currentProject.notes.length === 0) {
        noteList.innerHTML = `<li class="no-notes">No notes yet</li>`;
        return;
    }
    
    currentProject.notes.forEach(note => {
        const noteItem = document.createElement('li');
        noteItem.className = 'note-item';
        noteItem.setAttribute('data-id', note.id);
        
        // Add icon and note name
        noteItem.innerHTML = `
            <i class="fas fa-sticky-note"></i>
            <span>${note.title}</span>
        `;
        
        noteItem.addEventListener('click', () => viewNote(note.id));
        noteList.appendChild(noteItem);
    });
}

// View a note
function viewNote(noteId) {
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
            // Return to project view
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

// Show project board (hide note view)
function showProjectBoard() {
    if (currentProject) {
        document.getElementById('project-board').style.display = 'flex';
        document.getElementById('no-project-view').style.display = 'none';
        document.getElementById('note-view-container').style.display = 'none';
        
        // Deactivate all note items
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
    } else {
        showNoProjectView();
    }
}

// ==============================================
// UI RENDERING FUNCTIONS
// ==============================================

// Render projects in the sidebar
function renderProjects() {
    projectList.innerHTML = '';
    
    if (projects.length === 0) {
        projectList.innerHTML = `
            <li class="no-projects">No projects yet</li>
        `;
        showNoProjectView();
        return;
    }
    
    projects.forEach(project => {
        const projectItem = document.createElement('li');
        projectItem.className = 'project-item';
        projectItem.setAttribute('data-id', project.id);
        
        // Add icon and project name
        projectItem.innerHTML = `
            <i class="fas fa-project-diagram"></i>
            <span>${project.name}</span>
        `;
        
        if (currentProject && project.id === currentProject.id) {
            projectItem.classList.add('active');
        }
        
        projectItem.addEventListener('click', () => selectProject(project.id));
        projectList.appendChild(projectItem);
    });
    
    // If no current project is selected and there are projects, select the first one
    if (!currentProject && projects.length > 0) {
        selectProject(projects[0].id);
    } else if (!currentProject) {
        showNoProjectView();
    }
    
    updateDashboardStats();
}

// Add a button to the sidebar for creating notes
function renderSidebar() {
    // Existing code to render projects...
    
    // Add a create note button
    const createNoteBtn = document.createElement('button');
    createNoteBtn.className = 'btn-secondary create-note-btn';
    createNoteBtn.innerHTML = '<i class="fas fa-file-alt"></i> New Note';
    createNoteBtn.addEventListener('click', () => openNoteModal());
    
    document.querySelector('.sidebar-header').appendChild(createNoteBtn);
}

// Show the empty project view
function showNoProjectView() {
    projectTitle.textContent = 'Select a Project';
    noProjectView.style.display = 'flex';
    projectBoard.style.display = 'none';
    editProjectBtn.style.display = 'none';
    deleteProjectBtn.style.display = 'none';
}

// Render lists for the current project
function renderLists() {
    if (!currentProject) return;
    
    listsContainer.innerHTML = '';
    editProjectBtn.style.display = 'inline-block';
    deleteProjectBtn.style.display = 'inline-block';
    
    currentProject.lists.forEach(list => {
        const listElement = createListElement(list);
        listsContainer.appendChild(listElement);
    });
    
    // Set up drag and drop for cards
    setupDragAndDrop();
}

// Create a DOM element for a list
function createListElement(list) {
    const listElement = document.createElement('div');
    listElement.className = 'list';
    listElement.setAttribute('data-list-id', list.id);
    
    // List header
    const listHeader = document.createElement('div');
    listHeader.className = 'list-header';
    listHeader.innerHTML = `
        <span class="list-title">${list.name}</span>
        <div class="list-actions">
            <button class="rename-list-btn" title="Rename List">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-list-btn" title="Delete List">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Delete list button event
    listHeader.querySelector('.delete-list-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this list and all its cards?')) {
            deleteList(list.id);
        }
    });
    
    // Rename list button event
    listHeader.querySelector('.rename-list-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const newName = prompt('Enter new list name', list.name);
        if (newName && newName.trim()) {
            list.name = newName.trim();
            saveProjects();
            renderLists();
        }
    });
    
    // List cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'list-cards';
    cardsContainer.setAttribute('data-list-id', list.id);
    
    // Add cards to the list
    list.cards.forEach(card => {
        const cardElement = createCardElement(card, list.id);
        cardsContainer.appendChild(cardElement);
    });
    
    // List footer with add card button
    const listFooter = document.createElement('div');
    listFooter.className = 'list-footer';
    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn';
    addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add Card';
    addCardBtn.addEventListener('click', () => openCardModal(list.id));
    listFooter.appendChild(addCardBtn);
    
    // Assemble the list
    listElement.appendChild(listHeader);
    listElement.appendChild(cardsContainer);
    listElement.appendChild(listFooter);
    
    return listElement;
}

// Create a DOM element for a card
function createCardElement(card, listId) {
    const cardElement = document.createElement('div');
    cardElement.className = `card priority-${card.priority || 'medium'}`;
    cardElement.setAttribute('data-card-id', card.id);
    cardElement.setAttribute('draggable', 'true');
    
    // Format due date if exists
    let dueDateHTML = '';
    if (card.dueDate) {
        const dueDate = new Date(card.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        dueDateHTML = `
            <span class="card-due-date ${isOverdue ? 'overdue' : ''}">
                <i class="far fa-calendar"></i> 
                ${formatDate(dueDate)}
            </span>
        `;
    }
    
    // Add completion status checkbox
    const isCompleted = card.completed || false;
    
    // Card content with checkbox
    cardElement.innerHTML = `
        <div class="card-header">
            <div class="card-title ${isCompleted ? 'completed' : ''}">
                ${card.title}
            </div>
            <div class="task-checkbox">
                <input type="checkbox" class="complete-checkbox" ${isCompleted ? 'checked' : ''}>
            </div>
        </div>
        ${card.description ? `<div class="card-description">${truncate(card.description, 60)}</div>` : ''}
        <div class="card-meta">
            ${dueDateHTML}
            <span class="card-priority priority-${card.priority || 'medium'}">
                ${card.priority || 'Medium'}
            </span>
        </div>
    `;
    
    // Prevent checkbox from triggering card click
    const checkbox = cardElement.querySelector('.complete-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCardCompletion(card.id, listId);
    });
    
    // Card click event (edit)
    cardElement.addEventListener('click', () => {
        const list = currentProject.lists.find(l => l.id === listId);
        if (list) {
            const cardData = list.cards.find(c => c.id === card.id);
            if (cardData) {
                openCardModal(listId, cardData);
            }
        }
    });
    
    // Set up drag events
    cardElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('card-id', card.id);
        e.dataTransfer.setData('source-list-id', listId);
        setTimeout(() => {
            cardElement.classList.add('dragging');
        }, 0);
    });
    
    cardElement.addEventListener('dragend', () => {
        cardElement.classList.remove('dragging');
    });
    
    return cardElement;
}

// Set up drag and drop functionality
function setupDragAndDrop() {
    const listContainers = document.querySelectorAll('.list-cards');
    
    listContainers.forEach(container => {
        // Allow dropping
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
            
            const cardId = e.dataTransfer.getData('card-id');
            const sourceListId = e.dataTransfer.getData('source-list-id');
            const targetListId = container.getAttribute('data-list-id');
            
            if (cardId && sourceListId && targetListId && sourceListId !== targetListId) {
                moveCard(cardId, sourceListId, targetListId);
            }
        });
    });
}

// ==============================================
// MODAL FUNCTIONS
// ==============================================

// Open project creation/editing modal
function openProjectModal(project = null) {
    if (project) {
        // Edit existing project
        editingProjectId = project.id;
        projectNameInput.value = project.name;
        projectDescInput.value = project.description || '';
        
        modalTitle.textContent = 'Edit Project';
        document.querySelector('#project-form .btn-primary').textContent = 'Save Changes';
    } else {
        // New project
        editingProjectId = null;
        projectForm.reset();
        
        modalTitle.textContent = 'Create New Project';
        document.querySelector('#project-form .btn-primary').textContent = 'Create Project';
    }
    
    projectModal.classList.add('active');
    projectNameInput.focus();
}

// Open list creation modal
function openListModal() {
    listForm.reset();
    listModal.classList.add('active');
    listNameInput.focus();
}

// Open note creation modal
function openNoteModal(note = null) {
    if (!currentProject) return;
    
    if (note) {
        // Edit existing note
        editingNoteId = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content || '';
        
        // Clear tags and add existing ones
        noteTagsContainer.innerHTML = '';
        if (note.tags && note.tags.length) {
            note.tags.forEach(tag => addNoteTag(tag));
        }
        
        noteModalTitle.textContent = 'Edit Note';
        document.querySelector('#note-form .btn-primary').textContent = 'Save Changes';
    } else {
        // New note
        editingNoteId = null;
        noteForm.reset();
        noteTagsContainer.innerHTML = '';
        
        noteModalTitle.textContent = 'Create New Note';
        document.querySelector('#note-form .btn-primary').textContent = 'Create Note';
    }
    
    noteModal.classList.add('active');
    noteTitleInput.focus();
    
    // Initialize preview
    updateNotePreview();
}

// Open profile modal
function showProfileModal() {
    if (!currentUser) return;
    
    // Create profile modal if it doesn't exist
    let profileModal = document.getElementById('profile-modal');
    
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'profile-modal';
        profileModal.className = 'modal';
        
        profileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>User Profile</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-details">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle fa-4x"></i>
                        </div>
                        <div class="profile-info">
                            <h4>${currentUser.fullname}</h4>
                            <p>${currentUser.email}</p>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <i class="fas fa-project-diagram"></i>
                            <div>
                                <span class="stat-count">${projects.length}</span>
                                <span class="stat-label">Projects</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-tasks"></i>
                            <div>
                                <span class="stat-count" id="profile-tasks-count">0</span>
                                <span class="stat-label">Tasks</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary close-modal">Close</button>
                        <button type="button" class="btn-danger" id="logout-btn">Logout</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(profileModal);
        
        // Calculate tasks for profile modal
        let tasksCount = 0;
        projects.forEach(project => {
            project.lists.forEach(list => {
                tasksCount += list.cards.length;
            });
        });
        
        const profileTasksCount = profileModal.querySelector('#profile-tasks-count');
        if (profileTasksCount) {
            profileTasksCount.textContent = tasksCount;
        }
        
        // Add event listeners
        profileModal.querySelector('.close-modal').addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
        
        profileModal.querySelector('#logout-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
        
        // Close when clicking outside
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.remove('active');
            }
        });
    }
    
    profileModal.classList.add('active');
}

// Close all modals
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
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Save projects to localStorage
function saveProjects() {
    if (currentUser) {
        localStorage.setItem(`orangeAcademyProjects_${currentUser.id}`, JSON.stringify(projects));
    }
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Truncate text to a specific length
function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Basic markdown conversion (a more robust library should be used in production)
function convertMarkdownToHTML(markdown) {
    if (!markdown) return '';
    
    // This is very simplified - use a proper markdown library in production
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^# (.*)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*)/gm, '<h3>$1</h3>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert lists
    html = html.replace(/^\- (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Convert double newlines to paragraph breaks
    html = html.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraphs if not already
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }
    
    // Handle references to other cards/notes with [[Note name]]
    html = html.replace(/\[\[(.*?)\]\]/g, '<span class="internal-link">$1</span>');
    
    return html;
}

// Handle toolbar button clicks
function handleMarkdownAction(action) {
    // Determine which textarea is active
    const activeTextarea = document.activeElement;
    const textarea = activeTextarea && (activeTextarea.id === 'card-description' || activeTextarea.id === 'note-content') ? 
                     activeTextarea : cardDescInput;
    
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;
    
    switch(action) {
        case 'bold':
            replacement = `**${selected}**`;
            if (!selected) cursorOffset = 2;
            break;
        case 'italic':
            replacement = `*${selected}*`;
            if (!selected) cursorOffset = 1;
            break;
        case 'link':
            if (selected) {
                replacement = `[${selected}](url)`;
                cursorOffset = 3;
            } else {
                replacement = `[link text](url)`;
                cursorOffset = 1;
            }
            break;
        case 'list':
            replacement = selected ? selected.split('\n').map(line => `- ${line}`).join('\n') : '- ';
            break;
        case 'heading':
            replacement = `# ${selected}`;
            if (!selected) cursorOffset = 2;
            break;
        case 'reference':
            replacement = `[[${selected || 'Reference'}]]`;
            if (!selected) cursorOffset = 2;
            break;
    }
    
    // Insert the formatted text
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Set cursor position
    if (selected) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
    } else {
        textarea.selectionStart = start + replacement.length - cursorOffset;
        textarea.selectionEnd = start + replacement.length - cursorOffset;
    }
    
    // Update preview
    if (textarea.id === 'card-description') {
        updateMarkdownPreview();
    } else if (textarea.id === 'note-content') {
        updateNotePreview();
    }
    
    // Focus back on textarea
    textarea.focus();
}

// Update preview when editing card
function updateMarkdownPreview() {
    if (previewContent && cardDescInput) {
        // Use a basic markdown parser or integrate a library like marked.js
        const markdown = cardDescInput.value;
        previewContent.innerHTML = convertMarkdownToHTML(markdown);
    }
}

// Update preview when editing note
function updateNotePreview() {
    if (notePreviewContent && noteContentInput) {
        const markdown = noteContentInput.value;
        notePreviewContent.innerHTML = convertMarkdownToHTML(markdown);
    }
}
/**
 * Get the current selected project
 * @returns {object|null} The current project or null if none is selected
 */
function getCurrentProject() {
    return currentProject;
}
// Render the knowledge graph with D3.js
function openKnowledgeGraph() {
    const currentProject = getCurrentProject();
    if (!currentProject) return;
    
    graphProjectName.textContent = currentProject.name;
    graphView.classList.add('active');
    
    // Clear previous graph
    graphContent.innerHTML = '';
    
    // Create graph data structure
    const nodes = [];
    const links = [];
    
    // Add project as central node
    nodes.push({
        id: currentProject.id,
        name: currentProject.name,
        type: 'project',
        color: '#ff6f00'
    });
    
    // Add lists as nodes
    currentProject.lists.forEach(list => {
        nodes.push({
            id: list.id,
            name: list.name,
            type: 'list',
            color: '#3498db'
        });
        
        // Link list to project
        links.push({
            source: currentProject.id,
            target: list.id,
            value: 2
        });
        
        // Add cards as nodes
        list.cards.forEach(card => {
            let color;
            switch(card.priority) {
                case 'high': color = '#e74c3c'; break;
                case 'medium': color = '#f39c12'; break;
                default: color = '#2ecc71';
            }
            
            nodes.push({
                id: card.id,
                name: card.title,
                type: 'card',
                color: color,
                completed: card.completed || false,
                due: card.dueDate
            });
            
            // Link card to list
            links.push({
                source: list.id,
                target: card.id,
                value: 1
            });
        });
    });
    
    // Add notes as nodes
    if (currentProject.notes && currentProject.notes.length > 0) {
        currentProject.notes.forEach(note => {
            nodes.push({
                id: note.id,
                name: note.title,
                type: 'note',
                color: '#9b59b6',
                tags: note.tags || []
            });
            
            // Link note to project
            links.push({
                source: currentProject.id,
                target: note.id,
                value: 1.5
            });
        });
    }
    
    // Check if D3.js is available
    if (window.d3) {
        renderEnhancedD3Graph(nodes, links);
        
        // Set up zoom controls
        document.querySelector('.zoom-in-btn').addEventListener('click', () => zoomGraph(1.2));
        document.querySelector('.zoom-out-btn').addEventListener('click', () => zoomGraph(0.8));
        document.querySelector('.reset-zoom-btn').addEventListener('click', resetGraphZoom);
    } else {
        graphContent.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white;">
                <p>D3.js library is required for the knowledge graph visualization.</p>
                <p>Please ensure the D3.js script is properly loaded.</p>
            </div>
        `;
    }
}

// Add this new enhanced graph rendering function
function renderEnhancedD3Graph(nodes, links) {
    const width = graphContent.clientWidth;
    const height = graphContent.clientHeight;
    
    // Create SVG
    const svg = d3.select('#graph-content')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height]);
    
    // Add a subtle grid background
    const gridSize = 30;
    const gridGroup = svg.append('g')
        .attr('class', 'grid');
    
    for (let x = 0; x < width; x += gridSize) {
        gridGroup.append('line')
            .attr('x1', x)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', height)
            .attr('stroke', 'rgba(255, 255, 255, 0.05)')
            .attr('stroke-width', 1);
    }
    
    for (let y = 0; y < height; y += gridSize) {
        gridGroup.append('line')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
            .attr('stroke', 'rgba(255, 255, 255, 0.05)')
            .attr('stroke-width', 1);
    }
    
    // Set up zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => 
            d.type === 'project' ? 50 : 
            d.type === 'list' ? 40 : 30));
    
    // Create links with gradients
    const linksGroup = g.append('g')
        .attr('class', 'links');
    
    // Add gradient definitions
    const defs = svg.append('defs');
    
    links.forEach((link, i) => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
            const gradientId = `link-gradient-${i}`;
            const gradient = defs.append('linearGradient')
                .attr('id', gradientId)
                .attr('gradientUnits', 'userSpaceOnUse');
                
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', sourceNode.color);
                
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', targetNode.color);
        }
    });
    
    const link = linksGroup.selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', (d, i) => `url(#link-gradient-${i})`)
        .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
        .attr('stroke-dasharray', d => d.dashed ? '5,5' : '0');
    
    // Create node groups
    const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('click', nodeClicked)
        .on('mouseover', nodeMouseOver)
        .on('mouseout', nodeMouseOut);
    
    // Add glowing effect
    node.append('circle')
        .attr('r', d => 
            d.type === 'project' ? 30 : 
            d.type === 'list' ? 20 : 15)
        .attr('fill', d => d.color)
        .attr('opacity', 0.7)
        .attr('filter', 'url(#glow)');
    
    // Add main circle
    node.append('circle')
        .attr('r', d => 
            d.type === 'project' ? 25 : 
            d.type === 'list' ? 18 : 12)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    
    // Add completion indicator for cards
    node.filter(d => d.type === 'card')
        .append('circle')
        .attr('r', 4)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', d => d.completed ? '#2ecc71' : 'transparent')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
    
    // Add icons
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('fill', '#ffffff')
        .attr('font-size', d => 
            d.type === 'project' ? 14 : 10)
        .html(d => {
            switch(d.type) {
                case 'project': return '📋';
                case 'list': return '📑';
                case 'card': return '📝';
                case 'note': return '📌';
                default: return '';
            }
        });
    
    // Add labels
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d => 
            d.type === 'project' ? 45 : 35)
        .attr('fill', '#ffffff')
        .attr('font-size', d => 
            d.type === 'project' ? 14 : 12)
        .text(d => {
            const name = d.name || '';
            return name.length > 20 ? name.substring(0, 18) + '...' : name;
        });
    
    // Add glow filter
    const filter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
        
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');
        
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
    
    // Define tooltip
    const tooltip = d3.select('#graph-content')
        .append('div')
        .attr('class', 'graph-tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);
    
    // Update force simulation on tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => Math.max(30, Math.min(width - 30, d.source.x)))
            .attr('y1', d => Math.max(30, Math.min(height - 30, d.source.y)))
            .attr('x2', d => Math.max(30, Math.min(width - 30, d.target.x)))
            .attr('y2', d => Math.max(30, Math.min(height - 30, d.target.y)));
        
        node.attr('transform', d => {
            const x = Math.max(30, Math.min(width - 30, d.x));
            const y = Math.max(30, Math.min(height - 30, d.y));
            return `translate(${x},${y})`;
        });
    });
    
    // Define drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    // Node interaction functions
    function nodeClicked(event, d) {
        // Handle node click - view list, card or note
        if (d.type === 'card') {
            const list = currentProject.lists.find(list => 
                list.cards.some(card => card.id === d.id));
                
            if (list) {
                const card = list.cards.find(card => card.id === d.id);
                openCardModal(list.id, card);
            }
        } else if (d.type === 'note') {
            const note = currentProject.notes.find(note => note.id === d.id);
            if (note) viewNote(d.id);
        }
        
        // Add visual feedback
        d3.select(this).select('circle').transition()
            .duration(200)
            .attr('r', r => r + 5)
            .transition()
            .duration(200)
            .attr('r', d => 
                d.type === 'project' ? 25 : 
                d.type === 'list' ? 18 : 12);
    }
    
    function nodeMouseOver(event, d) {
        // Show tooltip with details
        let tooltipContent = `<div style="font-weight:bold">${d.name}</div>`;
        
        if (d.type === 'card') {
            if (d.due) tooltipContent += `<div>Due: ${formatDate(new Date(d.due))}</div>`;
            tooltipContent += `<div>Status: ${d.completed ? 'Completed' : 'Pending'}</div>`;
        }
        
        if (d.type === 'note' && d.tags && d.tags.length > 0) {
            tooltipContent += `<div>Tags: ${d.tags.join(', ')}</div>`;
        }
        
        tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.9);
            
        // Highlight connected links and nodes
        const connectedNodeIds = new Set();
        links.forEach(link => {
            if (link.source.id === d.id || link.source === d.id) {
                connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
            } else if (link.target.id === d.id || link.target === d.id) {
                connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
            }
        });
        
        node.classed('dimmed', n => n.id !== d.id && !connectedNodeIds.has(n.id));
        link.classed('highlighted', l => 
            l.source.id === d.id || l.target.id === d.id || 
            l.source === d.id || l.target === d.id);
    }
    
    function nodeMouseOut() {
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
            
        node.classed('dimmed', false);
        link.classed('highlighted', false);
    }
    
    // Initial center and zoom to fit
    const initialTransform = d3.zoomIdentity
        .translate(width/2, height/2)
        .scale(0.8)
        .translate(-width/2, -height/2);
        
    svg.call(zoom.transform, initialTransform);
}

// Zoom control functions
function zoomGraph(factor) {
    const svg = d3.select('#graph-content svg');
    const zoom = d3.zoom().on('zoom', (event) => {
        d3.select('#graph-content svg g').attr('transform', event.transform);
    });
    
    svg.transition()
        .duration(300)
        .call(zoom.scaleBy, factor);
}

function resetGraphZoom() {
    const svg = d3.select('#graph-content svg');
    const width = graphContent.clientWidth;
    const height = graphContent.clientHeight;
    
    const zoom = d3.zoom().on('zoom', (event) => {
        d3.select('#graph-content svg g').attr('transform', event.transform);
    });
    
    const initialTransform = d3.zoomIdentity
        .translate(width/2, height/2)
        .scale(0.8)
        .translate(-width/2, -height/2);
    
    svg.transition()
        .duration(500)
        .call(zoom.transform, initialTransform);
}

// Add a new tag
function addTag(tagName) {
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

// Add note tag
function addNoteTag(tagName) {
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

// Update tags input
function updateTagsInput() {
    const tags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => {
        return tag.textContent.trim();
    });
    
    cardTagsInput.value = JSON.stringify(tags);
}

// Update note tags input
function updateNoteTagsInput() {
    const tags = Array.from(noteTagsContainer.querySelectorAll('.tag')).map(tag => {
        return tag.textContent.trim();
    });
    
    noteTagsInput.value = JSON.stringify(tags);
}

// ==============================================
// USER AUTHENTICATION INTEGRATION
// ==============================================

// Check if user is logged in
function checkAuth() {
    const session = JSON.parse(localStorage.getItem('orangeAcademySession'));
    if (!session || !session.loggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Load user-specific data
function loadUserData() {
    const session = JSON.parse(localStorage.getItem('orangeAcademySession'));
    
    if (session && session.loggedIn) {
        currentUser = {
            id: session.userId,
            fullname: session.fullname,
            email: session.email
        };
        
        // Load user's projects
        const userProjects = localStorage.getItem(`orangeAcademyProjects_${currentUser.id}`);
        projects = userProjects ? JSON.parse(userProjects) : [];
        
        // Update stats and UI elements
        updateUserUI();
        updateDashboardStats();
    }
}

// Add a new function to update dashboard statistics
function updateDashboardStats() {
    // Update projects count
    const projectsCountElement = document.getElementById('projects-count');
    if (projectsCountElement) {
        projectsCountElement.textContent = projects.length;
    }
    
    // Count total tasks and completed tasks across all projects
    let totalTasks = 0;
    let completedTasks = 0;
    
    projects.forEach(project => {
        project.lists.forEach(list => {
            // Count all cards as tasks
            totalTasks += list.cards.length;
            
            // Count cards marked as completed
            list.cards.forEach(card => {
                if (card.completed) {
                    completedTasks++;
                }
            });
        });
    });
    
    // Update tasks count
    const tasksCountElement = document.getElementById('tasks-count');
    if (tasksCountElement) {
        tasksCountElement.textContent = totalTasks;
    }
    
    // Update completed count
    const completedCountElement = document.getElementById('completed-count');
    if (completedCountElement) {
        completedCountElement.textContent = completedTasks;
    }
}

// Update UI with user information
function updateUserUI() {
    if (currentUser) {
        // Update sidebar user information (keep this part)
        const sidebarUserName = document.getElementById('sidebar-user-name');
        if (sidebarUserName) {
            sidebarUserName.textContent = currentUser.fullname;
        }
        
        // Set current date in sidebar (keep this part)
        const sidebarCurrentDate = document.getElementById('sidebar-current-date');
        if (sidebarCurrentDate) {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            sidebarCurrentDate.textContent = new Date().toLocaleDateString(undefined, options);
        }

        // Update the navigation with user info (enhanced focus on this part)
        const navLinks = document.querySelector('.nav-links');
        
        if (navLinks) {
            // Remove any existing user info or logout buttons
            const existingUserInfo = navLinks.querySelector('.user-info');
            const existingLogout = navLinks.querySelector('.logout-link');
            
            if (existingUserInfo) existingUserInfo.remove();
            if (existingLogout) existingLogout.remove();
            
            // Add user info and logout button to navbar
            const userInfoLink = document.createElement('a');
            userInfoLink.href = '#';
            userInfoLink.className = 'user-info';
            userInfoLink.innerHTML = `<i class="fas fa-user"></i> ${currentUser.fullname}`;
            userInfoLink.addEventListener('click', function(e) {
                e.preventDefault();
                showProfileModal();
            });
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'logout-link';
            logoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            });
            
            navLinks.appendChild(userInfoLink);
            navLinks.appendChild(logoutLink);
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('orangeAcademySession');
    window.location.href = 'login.html';
}