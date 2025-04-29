/**
 * Card management module
 * Handles operations on cards like creation, editing, deletion
 */

import { getCurrentProject, saveProjects } from './data.js';
import { renderLists, updateDashboardStats } from './ui.js';
import { openCardModal } from './modals.js';
import { formatDate, truncate } from './utils.js';

/**
 * Create a new card
 * @param {string} listId - List ID
 * @param {string} title - Card title
 * @param {string} description - Card description
 * @param {string} dueDate - Card due date
 * @param {string} priority - Card priority
 * @param {Array} tags - Card tags
 * @returns {object|null} The created card or null if creation failed
 */
function createCard(listId, title, description, dueDate, priority, tags = []) {
    const currentProject = getCurrentProject();
    if (!currentProject) return null;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return null;
    
    const newCard = {
        id: 'card_' + Date.now(),
        title: title,
        description: description || '',
        dueDate: dueDate,
        priority: priority || 'medium',
        tags: tags,
        links: [],
        completed: false,
        created: new Date().toISOString()
    };
    
    list.cards.push(newCard);
    saveProjects();
    renderLists();
    
    return newCard;
}

/**
 * Update an existing card
 * @param {string} listId - List ID
 * @param {string} cardId - Card ID
 * @param {object} cardData - Updated card data
 * @returns {object|null} The updated card or null if update failed
 */
function updateCard(listId, cardId, cardData) {
    const currentProject = getCurrentProject();
    if (!currentProject) return null;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return null;
    
    let updatedCard = null;
    
    list.cards = list.cards.map(card => {
        if (card.id === cardId) {
            updatedCard = { ...card, ...cardData };
            return updatedCard;
        }
        return card;
    });
    
    saveProjects();
    renderLists();
    
    return updatedCard;
}

/**
 * Delete a card
 * @param {string} listId - List ID
 * @param {string} cardId - Card ID
 * @returns {boolean} Success status
 */
function deleteCard(listId, cardId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return false;
    
    const initialLength = list.cards.length;
    list.cards = list.cards.filter(card => card.id !== cardId);
    
    if (list.cards.length < initialLength) {
        saveProjects();
        renderLists();
        return true;
    }
    
    return false;
}

/**
 * Toggle card completion status
 * @param {string} cardId - Card ID
 * @param {string} listId - List ID
 * @returns {boolean} Success status
 */
function toggleCardCompletion(cardId, listId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    const list = currentProject.lists.find(list => list.id === listId);
    if (!list) return false;
    
    let success = false;
    
    list.cards = list.cards.map(card => {
        if (card.id === cardId) {
            success = true;
            return {
                ...card,
                completed: !card.completed
            };
        }
        return card;
    });
    
    if (success) {
        saveProjects();
        renderLists();
        updateDashboardStats();
    }
    
    return success;
}

/**
 * Create a DOM element for a card
 * @param {object} card - The card object
 * @param {string} listId - List ID
 * @returns {HTMLElement} The created card element
 */
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
        openCardModal(listId, card);
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

// Export functions
export {
    createCard,
    updateCard,
    deleteCard,
    toggleCardCompletion,
    createCardElement
};