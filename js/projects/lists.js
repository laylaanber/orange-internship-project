/**
 * List management module
 * Handles operations on lists like creation, deletion, and drag-and-drop
 */

import { getCurrentProject, saveProjects } from './data.js';
import { renderLists } from './ui.js';
import { openCardModal } from './modals.js';
import { createCardElement } from './cards.js';

/**
 * Create a new list
 * @param {string} name - List name
 * @returns {object|null} The created list or null if creation failed
 */
function createList(name) {
    const currentProject = getCurrentProject();
    if (!currentProject) return null;
    
    const newList = {
        id: 'list_' + Date.now(),
        name: name,
        cards: []
    };
    
    currentProject.lists.push(newList);
    saveProjects();
    renderLists();
    
    return newList;
}

/**
 * Rename a list
 * @param {string} listId - List ID
 * @param {string} newName - New list name
 * @returns {boolean} Success status
 */
function renameList(listId, newName) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    let success = false;
    
    currentProject.lists = currentProject.lists.map(list => {
        if (list.id === listId) {
            success = true;
            return {
                ...list,
                name: newName
            };
        }
        return list;
    });
    
    if (success) {
        saveProjects();
        renderLists();
    }
    
    return success;
}

/**
 * Delete a list
 * @param {string} listId - List ID to delete
 * @returns {boolean} Success status
 */
function deleteList(listId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    const initialLength = currentProject.lists.length;
    currentProject.lists = currentProject.lists.filter(list => list.id !== listId);
    
    if (currentProject.lists.length < initialLength) {
        saveProjects();
        renderLists();
        return true;
    }
    
    return false;
}

/**
 * Create a DOM element for a list
 * @param {object} list - The list object
 * @returns {HTMLElement} The created list element
 */
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
        if (confirm(`Are you sure you want to delete list "${list.name}"?`)) {
            deleteList(list.id);
        }
    });
    
    // Rename list button event
    listHeader.querySelector('.rename-list-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const newName = prompt('Enter new list name:', list.name);
        if (newName && newName.trim() !== '') {
            renameList(list.id, newName.trim());
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

/**
 * Set up drag and drop functionality
 */
function setupDragAndDrop() {
    const listContainers = document.querySelectorAll('.list-cards');
    
    listContainers.forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            const draggingElement = document.querySelector('.dragging');
            if (!draggingElement) return;
            
            const closestCard = getClosestCard(container, e.clientY);
            
            if (closestCard) {
                container.insertBefore(draggingElement, closestCard);
            } else {
                container.appendChild(draggingElement);
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const cardId = e.dataTransfer.getData('card-id');
            const sourceListId = e.dataTransfer.getData('source-list-id');
            const targetListId = container.getAttribute('data-list-id');
            
            if (cardId && sourceListId && targetListId && sourceListId !== targetListId) {
                moveCard(cardId, sourceListId, targetListId);
            }
        });
    });
}

/**
 * Get the closest card in a container based on mouse position
 * @param {HTMLElement} container - The container element
 * @param {number} y - The mouse Y position
 * @returns {HTMLElement|null} The closest card or null
 */
function getClosestCard(container, y) {
    const cards = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Move a card from one list to another
 * @param {string} cardId - Card ID
 * @param {string} sourceListId - Source list ID
 * @param {string} targetListId - Target list ID
 * @returns {boolean} Success status
 */
function moveCard(cardId, sourceListId, targetListId) {
    const currentProject = getCurrentProject();
    if (!currentProject) return false;
    
    const sourceList = currentProject.lists.find(list => list.id === sourceListId);
    const targetList = currentProject.lists.find(list => list.id === targetListId);
    
    if (!sourceList || !targetList) return false;
    
    const cardIndex = sourceList.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return false;
    
    // Remove from source list and add to target list
    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    targetList.cards.push(movedCard);
    
    saveProjects();
    return true;
}

// Export functions
export {
    createList,
    renameList,
    deleteList,
    createListElement,
    setupDragAndDrop,
    moveCard
};