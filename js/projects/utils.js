/**
 * Utilities module
 * Common utility functions used across the application
 */

// DOM elements for preview functionality
const previewContent = document.getElementById('preview-content');
const notePreviewContent = document.getElementById('note-preview-content');

/**
 * Format date for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!date) return '';
    
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncate(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Convert Markdown to HTML
 * @param {string} markdown - Markdown text to convert
 * @returns {string} HTML representation of the markdown
 */
function convertMarkdownToHTML(markdown) {
    if (!markdown) return '';
    
    // This is a simple implementation - for production use a library like marked.js
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
    
    // Convert numbered lists
    html = html.replace(/^(\d+)\. (.*)/gm, '<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>');
    
    // Convert code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert double newlines to paragraph breaks
    html = html.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraphs if not already
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }
    
    // Handle references to other notes/cards with [[Note name]]
    html = html.replace(/\[\[(.*?)\]\]/g, '<span class="internal-link">$1</span>');
    
    return html;
}

/**
 * Update Markdown preview for card description
 */
function updateMarkdownPreview() {
    const cardDescInput = document.getElementById('card-description');
    
    if (previewContent && cardDescInput) {
        const markdown = cardDescInput.value;
        previewContent.innerHTML = convertMarkdownToHTML(markdown);
    }
}

/**
 * Update Markdown preview for note content
 */
function updateNotePreview() {
    const noteContentInput = document.getElementById('note-content');
    
    if (notePreviewContent && noteContentInput) {
        const markdown = noteContentInput.value;
        notePreviewContent.innerHTML = convertMarkdownToHTML(markdown);
    }
}

/**
 * Handle markdown toolbar actions
 * @param {string} action - Action to perform (bold, italic, etc)
 * @param {HTMLElement} textarea - Target textarea element
 */
function handleMarkdownAction(action, textarea) {
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
    
    // Update preview based on which textarea is being edited
    if (textarea.id === 'card-description') {
        updateMarkdownPreview();
    } else if (textarea.id === 'note-content') {
        updateNotePreview();
    }
    
    // Focus back on textarea
    textarea.focus();
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timeout;
    
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

// Export functions
export {
    formatDate,
    truncate,
    convertMarkdownToHTML,
    updateMarkdownPreview,
    updateNotePreview,
    handleMarkdownAction,
    generateUniqueId,
    debounce
};