/**
 * UI Rendering module
 * Handles rendering of projects, lists, cards, and notes
 */

import { getAllProjects, getCurrentProject, selectProject, getProjectStats } from './data.js';
import { createCardElement } from './cards.js';
import { openProjectModal, openListModal, openCardModal, openNoteModal } from './modals.js';
import { setupDragAndDrop } from './lists.js';

// DOM Elements
const projectList = document.getElementById('project-list');
const projectTitle = document.getElementById('project-title');
const noProjectView = document.getElementById('no-project-view');
const projectBoard = document.getElementById('project-board');
const listsContainer = document.getElementById('lists-container');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarCurrentDate = document.getElementById('sidebar-current-date');
const projectsCountElement = document.getElementById('projects-count');
const tasksCountElement = document.getElementById('tasks-count');
const completedCountElement = document.getElementById('completed-count');

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Project buttons
    const newProjectBtn = document.getElementById('new-project-btn');
    const createFirstProjectBtn = document.getElementById('create-first-project');
    const editProjectBtn = document.getElementById('edit-project-btn');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    const addListBtn = document.getElementById('add-list-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const mainSidebar = document.querySelector('.main-sidebar');
    
    // Add event listeners
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => openProjectModal());
    }
    
    if (createFirstProjectBtn) {
        createFirstProjectBtn.addEventListener('click', () => openProjectModal());
    }
    
    if (editProjectBtn) {
        editProjectBtn.addEventListener('click', () => {
            const currentProject = getCurrentProject();
            if (currentProject) {
                openProjectModal(currentProject);
            }
        });
    }
    
    if (deleteProjectBtn) {
        deleteProjectBtn.addEventListener('click', () => {
            const currentProject = getCurrentProject();
            if (currentProject && confirm('Are you sure you want to delete this project?')) {
                if (deleteProject(currentProject.id)) {
                    renderProjects();
                }
            }
        });
    }
    
    if (addListBtn) {
        addListBtn.addEventListener('click', () => openListModal());
    }
    
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', () => openNoteModal());
    }
    
    if (sidebarCollapseBtn && mainSidebar) {
        sidebarCollapseBtn.addEventListener('click', function() {
            mainSidebar.classList.toggle('collapsed');
        });
    }
}

/**
 * Render projects in the sidebar
 */
function renderProjects() {
    if (!projectList) return;
    
    const projects = getAllProjects();
    const currentProject = getCurrentProject();
    
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
        
        projectItem.addEventListener('click', () => {
            selectProject(project.id);
            renderLists();
            renderSidebarNotes();
        });
        
        projectList.appendChild(projectItem);
    });
    
    // If no current project is selected and there are projects, select the first one
    if (!currentProject && projects.length > 0) {
        selectProject(projects[0].id);
        renderLists();
        renderSidebarNotes();
    } else if (!currentProject) {
        showNoProjectView();
    }
    
    updateDashboardStats();
}

/**
 * Show the empty project view
 */
function showNoProjectView() {
    if (projectTitle) projectTitle.textContent = 'Select a Project';
    if (noProjectView) noProjectView.style.display = 'flex';
    if (projectBoard) projectBoard.style.display = 'none';
    
    const editProjectBtn = document.getElementById('edit-project-btn');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    
    if (editProjectBtn) editProjectBtn.style.display = 'none';
    if (deleteProjectBtn) deleteProjectBtn.style.display = 'none';
}

/**
 * Render lists for the current project
 */
function renderLists() {
    const currentProject = getCurrentProject();
    if (!currentProject || !listsContainer) return;
    
    listsContainer.innerHTML = '';
    
    const editProjectBtn = document.getElementById('edit-project-btn');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    
    if (editProjectBtn) editProjectBtn.style.display = 'inline-block';
    if (deleteProjectBtn) deleteProjectBtn.style.display = 'inline-block';
    
    if (projectTitle) projectTitle.textContent = currentProject.name;
    if (noProjectView) noProjectView.style.display = 'none';
    if (projectBoard) projectBoard.style.display = 'flex';
    
    currentProject.lists.forEach(list => {
        const listElement = createListElement(list);
        listsContainer.appendChild(listElement);
    });
    
    // Set up drag and drop
    setupDragAndDrop();
    
    // Update dashboard stats
    updateDashboardStats();
}

/**
 * Create a DOM element for a list
 * @param {object} list - The list object
 * @returns {HTMLElement} The created list element
 */
function createListElement(list) {
    // Implementation moved to lists.js
    return document.createElement('div');
}

/**
 * Render notes in the sidebar
 */
function renderSidebarNotes() {
    const noteList = document.getElementById('sidebar-note-list');
    const currentProject = getCurrentProject();
    
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

/**
 * Update the dashboard statistics
 */
function updateDashboardStats() {
    const stats = getProjectStats();
    
    if (projectsCountElement) {
        projectsCountElement.textContent = stats.projectsCount;
    }
    
    if (tasksCountElement) {
        tasksCountElement.textContent = stats.tasksCount;
    }
    
    if (completedCountElement) {
        completedCountElement.textContent = stats.completedCount;
    }
}

/**
 * Update the user-related UI elements
 */
function updateUserUI() {
    const user = getCurrentUser();
    
    if (user && sidebarUserName) {
        sidebarUserName.textContent = user.fullname;
    }
    
    if (sidebarCurrentDate) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        sidebarCurrentDate.textContent = new Date().toLocaleDateString(undefined, options);
    }
}

// Export functions
export {
    renderProjects,
    renderLists,
    renderSidebarNotes,
    updateDashboardStats,
    showNoProjectView,
    setupEventListeners
};