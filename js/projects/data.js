/**
 * Data management module for projects and tasks
 * Handles loading, saving, and manipulating project data
 */

// Application state
let currentUser = null;
let projects = [];
let currentProject = null;

/**
 * Load user data and projects
 */
function loadUserData() {
    const session = JSON.parse(localStorage.getItem('orangeAcademySession'));
    
    if (session && session.loggedIn) {
        currentUser = {
            id: session.userId,
            fullname: session.fullname,
            email: session.email
        };
        
        return true;
    }
    
    return false;
}

/**
 * Load projects for the current user
 */
function loadProjects() {
    if (loadUserData()) {
        // Load user's projects
        const userProjects = localStorage.getItem(`orangeAcademyProjects_${currentUser.id}`);
        projects = userProjects ? JSON.parse(userProjects) : [];
        
        return true;
    }
    
    return false;
}

/**
 * Save projects to localStorage
 */
function saveProjects() {
    if (currentUser) {
        localStorage.setItem(`orangeAcademyProjects_${currentUser.id}`, JSON.stringify(projects));
    }
}

/**
 * Create a new project
 * @param {string} name - Project name
 * @param {string} description - Project description
 * @returns {object} The created project
 */
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
        notes: [],
        connections: [],
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    projects.push(newProject);
    saveProjects();
    
    return newProject;
}

/**
 * Update an existing project
 * @param {string} projectId - Project ID
 * @param {string} name - New project name
 * @param {string} description - New project description
 * @returns {object|null} The updated project or null if not found
 */
function updateProject(projectId, name, description) {
    let updatedProject = null;
    
    projects = projects.map(project => {
        if (project.id === projectId) {
            updatedProject = {
                ...project,
                name,
                description,
                lastModified: new Date().toISOString()
            };
            return updatedProject;
        }
        return project;
    });
    
    saveProjects();
    return updatedProject;
}

/**
 * Delete a project
 * @param {string} projectId - Project ID to delete
 * @returns {boolean} Success status
 */
function deleteProject(projectId) {
    const initialLength = projects.length;
    projects = projects.filter(project => project.id !== projectId);
    
    if (projects.length < initialLength) {
        saveProjects();
        // If deleted project was the current one, clear currentProject
        if (currentProject && currentProject.id === projectId) {
            currentProject = null;
        }
        return true;
    }
    
    return false;
}

/**
 * Select a project
 * @param {string} projectId - Project ID to select
 * @returns {object|null} Selected project or null if not found
 */
function selectProject(projectId) {
    currentProject = projects.find(project => project.id === projectId);
    return currentProject;
}

/**
 * Get the current project
 * @returns {object|null} Current project or null if none selected
 */
function getCurrentProject() {
    return currentProject;
}

/**
 * Get all projects
 * @returns {Array} All projects
 */
function getAllProjects() {
    return projects;
}

/**
 * Get current user
 * @returns {object|null} Current user or null if not logged in
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Calculate project statistics
 * @returns {object} Object with counts for projects, tasks, and completed tasks
 */
function getProjectStats() {
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
    
    return {
        projectsCount: projects.length,
        tasksCount: totalTasks,
        completedCount: completedTasks
    };
}

// Export functions
export {
    loadUserData,
    loadProjects,
    saveProjects,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    getCurrentProject,
    getAllProjects,
    getCurrentUser,
    getProjectStats
};