// ==============================================
// ORANGE CODING ACADEMY TASK MANAGER
// ==============================================

// ==============================================
// DOM ELEMENTS
// ==============================================
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const dueDateInput = document.getElementById('due-date-input');
const prioritySelect = document.getElementById('priority-select');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// ==============================================
// APPLICATION STATE
// ==============================================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ==============================================
// EVENT LISTENERS
// ==============================================
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
clearCompletedBtn.addEventListener('click', clearCompleted);
searchInput.addEventListener('input', renderTasks);
sortSelect.addEventListener('change', renderTasks);

// Set up filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Apply filter
        currentFilter = button.getAttribute('data-filter');
        renderTasks();
    });
});

// Initialize
renderTasks();
updateCounter();

// ==============================================
// TASK MANAGEMENT FUNCTIONS
// ==============================================

//1** Add Task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === ''){
        alert('Please enter a task!');
         return;
    }
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        dueDate: dueDateInput.value || null,
        priority: prioritySelect.value
    };
//* Add task to the list
    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'medium';
    renderTasks();
    updateCounter();
}

//* Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateCounter();
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasks();
    renderTasks();
    updateCounter();
}

//* Edit Task
function editTask(id, newText) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateCounter();
}

// ==============================================
// TASK EDITING INTERFACE
// ==============================================

// Start editing a task
function startEditTask(taskElement, taskId) {
    // Find the task in our array
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskTextElement = taskElement.querySelector('.task-text');

    // Create edit container
    const editContainer = document.createElement('div');
    editContainer.className = 'editing-container';

    // Create text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'edit-input';
    textInput.value = task.text;

    // Create date input
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'edit-date';
    if (task.dueDate) {
        dateInput.value = task.dueDate;
    }

    // Create priority select
    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'edit-priority';

    const priorities = [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' }
    ];

    priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority.value;
        option.textContent = priority.label;
        option.selected = task.priority === priority.value;
        prioritySelect.appendChild(option);
    });

    // Create action buttons container
    const actionButtons = document.createElement('div');
    actionButtons.className = 'edit-actions';

    // Create save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-edit-btn';
    saveButton.textContent = 'Save';

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-edit-btn';
    cancelButton.textContent = 'Cancel';

    // Store original content to restore if canceled
    const originalContent = taskTextElement.innerHTML;

    // Add elements to container
    editContainer.appendChild(textInput);
    editContainer.appendChild(dateInput);
    editContainer.appendChild(prioritySelect);
    actionButtons.appendChild(saveButton);
    actionButtons.appendChild(cancelButton);
    editContainer.appendChild(actionButtons);

    // Replace text with edit form
    taskTextElement.innerHTML = '';
    taskTextElement.appendChild(editContainer);

    // Focus the input
    textInput.focus();

    // Handle saving the edit
    function saveEdit() {
        const newText = textInput.value.trim();
        if (newText) {
            // Update task with all edited values
            tasks = tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        text: newText,
                        dueDate: dateInput.value || null,
                        priority: prioritySelect.value
                    };
                }
                return t;
            });

            saveTasks();
            renderTasks();
        } else {
            // If text is empty, just restore the original
            taskTextElement.innerHTML = originalContent;
        }
    }

    // Handle cancel
    function cancelEdit() {
        taskTextElement.innerHTML = originalContent;
    }

    // Event listeners
    saveButton.addEventListener('click', saveEdit);
    cancelButton.addEventListener('click', cancelEdit);

    // Handle Enter key
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

// ==============================================
// RENDERING FUNCTIONS
// ==============================================

// Render tasks based on the current filter and search term
function renderTasks() {
    // Clear the list
    taskList.innerHTML = '';

    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter tasks based on the current filter and search term
    const filteredTasks = tasks.filter(task => {
        // Filter by completion status
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;

        // Filter by search term
        if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) return false;

        return true;
    });

    // Sort tasks
    const sortBy = sortSelect.value;

    if (sortBy === 'date-asc') {
        filteredTasks.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'date-desc') {
        filteredTasks.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'alpha-asc') {
        filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'alpha-desc') {
        filteredTasks.sort((a, b) => b.text.localeCompare(a.text));
    } else if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
    } else if (sortBy === 'due-date') {
        filteredTasks.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    // Create task elements
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);

        if (task.priority) {
            taskItem.classList.add(`priority-${task.priority}`);
        }

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Create task text
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        // Add due date if it exists
        if (task.dueDate) {
            const dueDate = document.createElement('span');
            dueDate.className = 'due-date';

            const date = new Date(task.dueDate);
            const today = new Date();
            const isOverdue = date < today && !task.completed;

            dueDate.textContent = `Due: ${formatDate(date)}`;
            if (isOverdue) dueDate.classList.add('overdue');

            taskText.appendChild(document.createElement('br'));
            taskText.appendChild(dueDate);
        }

        // Create action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => startEditTask(taskItem, task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Assemble task item
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(actionsDiv);

        taskList.appendChild(taskItem);
    });
}

// Update the task counter
function updateCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ==============================================
// NAVIGATION MENU FUNCTIONS
// ==============================================

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
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            
            // Reset hamburger icon
            const spans = menuToggle.querySelectorAll('span');
            if (spans.length === 3) {
                spans[0].classList.remove('rotate-down');
                spans[1].classList.remove('fade-out');
                spans[2].classList.remove('rotate-up');
            }
        }
    });
}

// ==============================================
// USER AUTHENTICATION INTEGRATION
// ==============================================

// Check if the user is logged in
function checkAuth() {
    const session = JSON.parse(localStorage.getItem('orangeAcademySession'));
    if (!session || !session.loggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Check if user is on index.html directly (not via navigation)
    const directLoad = !document.referrer.includes('projects.html');
    if (directLoad && window.location.pathname.endsWith('index.html')) {
        // Redirect to projects page as the main dashboard
        window.location.href = 'projects.html';
        return false;
    }
    
    return true;
}

// Get current user information
function getCurrentUser() {
    const session = JSON.parse(localStorage.getItem('orangeAcademySession'));
    return session;
}

// Update UI with user information
function updateUserUI() {
    const user = getCurrentUser();
    if (user) {
        // Update the navigation with user info
        const navLinks = document.querySelector('.nav-links');
        
        if (navLinks) {
            // Add user info and logout button
            const userInfoLink = document.createElement('a');
            userInfoLink.href = '#';
            userInfoLink.innerHTML = `<i class="fas fa-user"></i> ${user.fullname}`;
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
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

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        updateUserUI();
        
        // Update localStorage key to be user-specific
        const user = getCurrentUser();
        const tasksKey = `orangeAcademyTasks_${user.userId}`;
        
        // Load user-specific tasks
        tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];
        renderTasks();
        updateCounter();
        
        // Update the saveTasks function to use user-specific key
        window.saveTasks = function() {
            const user = getCurrentUser();
            localStorage.setItem(`orangeAcademyTasks_${user.userId}`, JSON.stringify(tasks));
        };
    }
});