// filepath: c:\Users\Dell\Desktop\orangeInternship\sun-4-27\js\projects\graph.js
/**
 * Knowledge Graph module
 * Handles visualization of connections between projects, lists, cards, and notes
 */

import { getCurrentProject } from './data.js';

// DOM elements
const graphView = document.getElementById('graph-view');
const graphContent = document.getElementById('graph-content');
const graphProjectName = document.getElementById('graph-project-name');

/**
 * Initialize the graph view and its event listeners
 */
function initGraphView() {
    // Setup graph view toggle button
    const graphViewBtn = document.getElementById('graph-view-btn');
    
    if (graphViewBtn) {
        graphViewBtn.addEventListener('click', openKnowledgeGraph);
    }
    
    // Setup close button
    const closeGraphBtn = document.querySelector('.close-graph');
    
    if (closeGraphBtn) {
        closeGraphBtn.addEventListener('click', () => {
            graphView.classList.remove('active');
        });
    }
    
    // Add zoom controls if they don't exist
    if (!document.querySelector('.graph-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'graph-controls';
        controlsDiv.innerHTML = `
            <button class="zoom-in-btn" title="Zoom In"><i class="fas fa-plus"></i></button>
            <button class="zoom-out-btn" title="Zoom Out"><i class="fas fa-minus"></i></button>
            <button class="reset-zoom-btn" title="Reset View"><i class="fas fa-sync-alt"></i></button>
        `;
        
        graphView.appendChild(controlsDiv);
        
        // Add zoom event listeners
        controlsDiv.querySelector('.zoom-in-btn').addEventListener('click', () => zoomGraph(1.2));
        controlsDiv.querySelector('.zoom-out-btn').addEventListener('click', () => zoomGraph(0.8));
        controlsDiv.querySelector('.reset-zoom-btn').addEventListener('click', resetGraphZoom);
    }
    
    // Add legend if it doesn't exist
    if (!document.querySelector('.graph-view-legend')) {
        const legendDiv = document.createElement('div');
        legendDiv.className = 'graph-view-legend';
        legendDiv.innerHTML = `
            <ul>
                <li><span class="legend-color" style="background-color: #ff6f00;"></span> Project</li>
                <li><span class="legend-color" style="background-color: #3498db;"></span> List</li>
                <li><span class="legend-color" style="background-color: #e74c3c;"></span> High Priority</li>
                <li><span class="legend-color" style="background-color: #f39c12;"></span> Medium Priority</li>
                <li><span class="legend-color" style="background-color: #2ecc71;"></span> Low Priority</li>
                <li><span class="legend-color" style="background-color: #9b59b6;"></span> Note</li>
            </ul>
        `;
        
        graphView.appendChild(legendDiv);
    }
}

/**
 * Open the knowledge graph visualization
 */
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
                case 'high':
                    color = '#e74c3c';
                    break;
                case 'medium':
                    color = '#f39c12';
                    break;
                default:
                    color = '#2ecc71';
            }
            
            nodes.push({
                id: card.id,
                name: card.title,
                type: 'card',
                color: color
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
    if (currentProject.notes) {
        currentProject.notes.forEach(note => {
            nodes.push({
                id: note.id,
                name: note.title,
                type: 'note',
                color: '#9b59b6'
            });
            
            // Link note to project
            links.push({
                source: currentProject.id,
                target: note.id,
                value: 1.5
            });
            
            // Look for references to other notes/cards in content
            if (note.content) {
                const references = note.content.match(/\[\[(.*?)\]\]/g);
                if (references) {
                    references.forEach(ref => {
                        const name = ref.replace('[[', '').replace(']]', '');
                        const targetNote = currentProject.notes.find(n => n.title === name);
                        
                        if (targetNote) {
                            links.push({
                                source: note.id,
                                target: targetNote.id,
                                value: 0.5,
                                dashed: true
                            });
                        }
                    });
                }
            }
        });
    }
    
    // Check if D3.js is available
    if (window.d3) {
        renderD3Graph(nodes, links);
    } else {
        graphContent.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white;">
                <p>D3.js library is required for the knowledge graph visualization.</p>
                <p>Please make sure that the D3.js script is properly loaded.</p>
                <pre>&lt;script src="https://d3js.org/d3.v7.min.js"&gt;&lt;/script&gt;</pre>
            </div>
        `;
    }
}

/**
 * Render the graph using D3.js
 * @param {Array} nodes - Array of node objects
 * @param {Array} links - Array of link objects
 */
function renderD3Graph(nodes, links) {
    const width = graphContent.clientWidth;
    const height = graphContent.clientHeight;
    
    // Current transform for zooming
    let currentTransform = d3.zoomIdentity;
    
    // Create SVG element
    const svg = d3.select('#graph-content')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);
    
    // Add a background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'rgba(0,0,0,0.8)');
    
    // Create a container group for zoom
    const g = svg.append('g');
    
    // Set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            currentTransform = event.transform;
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40));
    
    // Create links
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value))
        .attr('stroke-dasharray', d => d.dashed ? '5,5' : '0');
    
    // Create nodes
    const node = g.append('g')
        .selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Node circles
    node.append('circle')
        .attr('r', d => d.type === 'project' ? 30 : d.type === 'list' ? 20 : 15)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
    
    // Node labels
    node.append('text')
        .attr('dx', 0)
        .attr('dy', d => d.type === 'project' ? 40 : 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', d => d.type === 'project' ? 14 : 12)
        .text(d => d.name)
        .attr('pointer-events', 'none')
        .each(function(d) {
            const text = d3.select(this);
            const words = d.name.split(' ');
            const lineHeight = 1.1; // ems
            text.text(null);
            
            // Limit to 15 characters per line
            const tspan = text.append('tspan')
                .attr('x', 0)
                .attr('dy', 0);
            
            let line = '';
            let lineCount = 0;
            
            words.forEach((word, i) => {
                const testLine = line + word + ' ';
                if (testLine.length > 15) {
                    tspan.text(line);
                    line = word + ' ';
                    lineCount++;
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', lineHeight + 'em')
                        .text(line);
                } else {
                    line = testLine;
                }
            });
            
            if (line.length && lineCount === 0) {
                tspan.text(line);
            }
        });
    
    // Type indicators (icons)
    node.append('text')
        .attr('dx', 0)
        .attr('dy', 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 10)
        .text(d => {
            switch(d.type) {
                case 'project': return '📋';
                case 'list': return '📑';
                case 'card': return '📝';
                case 'note': return '📌';
                default: return '';
            }
        })
        .attr('pointer-events', 'none');
    
    // Update simulation on tick
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
    
    // Drag functions
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
}

/**
 * Zoom the graph
 * @param {number} factor - Zoom factor (> 1 to zoom in, < 1 to zoom out)
 */
function zoomGraph(factor) {
    const svg = d3.select('#graph-content svg');
    const zoom = d3.zoom().on('zoom', (event) => {
        d3.select('#graph-content svg g').attr('transform', event.transform);
    });
    
    svg.transition().duration(300).call(
        zoom.scaleBy, factor
    );
}

/**
 * Reset the graph zoom level
 */
function resetGraphZoom() {
    const svg = d3.select('#graph-content svg');
    const zoom = d3.zoom().on('zoom', (event) => {
        d3.select('#graph-content svg g').attr('transform', event.transform);
    });
    
    svg.transition().duration(300).call(
        zoom.transform, d3.zoomIdentity
    );
}

// Export functions
export {
    initGraphView,
    openKnowledgeGraph
};