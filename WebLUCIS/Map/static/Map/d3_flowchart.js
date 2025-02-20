import { heirarchydata } from './AJAX_multiple.js';
import { defineArrowhead, drawNodes, drawLinks, addLabels } from './utils.js';

// var root;

// Global variables for root and update
let root;
let update;
let svg;
let duration = 50;
let nodeId;

// Function to handle hierarchy conversion
function convertToHierarchy(data, parentName = "Land Use") {
    const result = {
        name: parentName,
        children: []
    };

    for (const key in data) {
        if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            const child = {
                name: key,
                children: convertToHierarchy(data[key], key)
            };
            result.children.push(child);
        } else if (Array.isArray(data[key])) {
            const child = {
                name: key,
                children: data[key].map(item => ({ name: item }))
            };
            result.children.push(child);
        }
    }

    return result.children;
}

// Function to add unique IDs to nodes
function addIdsToData(data, parentId = "a0") {
    let index = 0;

    if (Array.isArray(data)) {
        data.forEach((item, i) => {
            const itemId = `${parentId}-${index}`;
            item.id = itemId;

            if (item.children && Array.isArray(item.children)) {
                addIdsToData(item.children, itemId);
            }

            index++;
        });
    } else if (typeof data === 'object' && data !== null) {
        data.id = parentId;

        if (data.children && Array.isArray(data.children)) {
            addIdsToData(data.children, parentId);
        }
    }
}

// Function to collapse nodes
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

$(document).on("click", "#legend-flowchart", function () {
    const modal = new bootstrap.Modal(document.getElementById('legendModal'));
    modal.show();
});
function initializeFlowchart(elementId = null) {
    // Clear previous SVG content
    d3.select("#tree-container").select("svg").remove();


    // Sample hierarchical data
    const data = {
        name: "Land Use",
        children: convertToHierarchy(heirarchydata)
    };


    addIdsToData(data.children);

    // Set up dimensions
    const margin = { top: 20, right: 90, bottom: 30, left: 450 },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    svg = d3.select("#tree-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    root = d3.hierarchy(data, d => d.children);
    root.x0 = height / 2;
    root.y0 = 0;
    root.children.forEach(collapse);


    updateTree(root, elementId);
}
function updateTree(source, elementId = null) {


    const treeLayout = d3.tree().nodeSize([140, 120]);
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    nodes.forEach(d => d.y = d.depth * 180);

    const node = svg.selectAll('g.node')
        .data(nodes);

    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${source.x0},${source.y0})`)
        .on('click', click);

    nodeEnter.append('rect')
        .attr('width', 120)
        .attr('height', 40)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('x', -60)
        .attr('y', -20)
        .attr('id', d => d.data.id)
        .style('fill', d => d._children ? 'lightsteelblue' : '#fff');

    // nodeEnter.append('text')
    //     .attr('dy', 5)
    //     .attr('text-anchor', 'middle')
    //     .text(d => d.data.name);

    nodeEnter.append('foreignObject')
    .attr('width', 110) // Slightly smaller than the rect width
    .attr('height', 36) // Slightly smaller than the rect height
    .attr('x', -55) // Center horizontally (half of width)
    .attr('y', -18) // Center vertically (half of height)
    .append('xhtml:div')
    .style('width', '100%')
    .style('height', '100%')
    .style('overflow', 'hidden') // Hide overflowing text
    .style('text-align', 'center') // Horizontally center the text
    .style('display', 'flex') // Use flexbox for vertical centering
    .style('align-items', 'center') // Center vertically
    .style('justify-content', 'center') // Center horizontally
    .style('font-size', '12px') // Optional: Adjust font size
    .text(d => d.data.name);


    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition()
        .duration(duration)
        .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeUpdate.select('rect')
        .style('fill', d => d._children ? 'lightsteelblue' : 'steelblue')
        .attr('cursor', 'pointer');

    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', d => `translate(${source.x},${source.y})`)
        .remove();

    nodeExit.select('rect')
        .attr('width', 1e-6)
        .attr('height', 1e-6);

    const link = svg.selectAll('path.link')
        .data(links, d => d.id);

    const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
        });

    const linkUpdate = linkEnter.merge(link);
    linkUpdate.transition()
        .duration(duration)
        .attr('d', d => diagonal(d, d.parent));

    const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', d => {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o);
        })
        .remove();

    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    function diagonal(s, d) {
        return `M ${s.x} ${s.y}
          C ${(s.x + d.x) / 2} ${s.y},
            ${(s.x + d.x) / 2} ${d.y},
            ${d.x} ${d.y}`;
    }

    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
           
            if (d.parent) {
                d.parent.children.forEach(child => {
                    if (child !== d && child.children) {
                        child._children = child.children;
                        child.children = null;
                    }
                });
            }
            d.children = d._children;
            d._children = null;
        }
        if (!d.children && !d._children)
            {
                const content = addNewSvgContainer(d);
openModalOverlay(content);
                
            } 

        updateTree(d);
        


    }
    if (nodeId) {
        console.log(nodeId);
        // d3.select("#"+"a0-0-0-1-1").style("fill", "green");
        d3.select("#" + nodeId).style("fill", "green");
    
    }
    // Open overlay inside the modal
// Open overlay function
function openModalOverlay(content) {
    const overlayContent = document.getElementById('modal-overlay-items');
    const modalOverlay = document.getElementById('modal-overlay-content');
  
    // Populate overlay with content
    overlayContent.innerHTML = content;
  
    // Show the overlay
    modalOverlay.classList.remove('hidden');
  }
  
  // Close overlay function
  function closeModalOverlay() {
    const modalOverlay = document.getElementById('modal-overlay-content');
    modalOverlay.classList.add('hidden');
  }
  
  // Event listener for close button
  document.getElementById('modal-overlay-close').addEventListener('click', closeModalOverlay);   

  function addNewSvgContainer(nodeData) {
          // Create an in-memory SVG container using D3
    const svgContainer = d3.create("svg")
    .attr("class", "flowchart-svg") // Use a class for styling instead of a specific id
    .attr("width", 1400)
    .attr("height", 400);
    
    console.log(nodeData.data.name);

// Flowchart Data
var NODE_IDS = {
    A: 'Primary Roads',
    B: 'Land Units',
    C: 'Secondary Roads',
    D: 'Calculate Distance',
    E: 'Calculate Distance for Secondary',
    F: 'Distance to Primary Roads',
    G: 'Distance to Secondary Roads',
    H: 'Rescale as Suitability',
    I: 'Rescale Secondary Suitability',
    J: 'Rescaled Distance to Primary Roads',
    K: 'Rescaled Distance to Secondary Roads',
    L: 'Weighted Sum of Distances',
    M: 'Road Accessibility Index'
};

var nodes = [
    { id: NODE_IDS.A, xPercent: 0.07, yPercent: 0.17, type: 'blue' },
    { id: NODE_IDS.B, xPercent: 0.07, yPercent: 0.34, type: 'blue' },
    { id: NODE_IDS.C, xPercent: 0.07, yPercent: 0.5, type: 'blue' },
    { id: NODE_IDS.D, xPercent: 0.21, yPercent: 0.17, type: 'yellow' },
    { id: NODE_IDS.E, xPercent: 0.21, yPercent: 0.5, type: 'yellow' },
    { id: NODE_IDS.F, xPercent: 0.36, yPercent: 0.17, type: 'green' },
    { id: NODE_IDS.G, xPercent: 0.36, yPercent: 0.5, type: 'green' },
    { id: NODE_IDS.H, xPercent: 0.5, yPercent: 0.17, type: 'yellow' },
    { id: NODE_IDS.I, xPercent: 0.5, yPercent: 0.5, type: 'yellow' },
    { id: NODE_IDS.J, xPercent: 0.64, yPercent: 0.17, type: 'green' },
    { id: NODE_IDS.K, xPercent: 0.64, yPercent: 0.5, type: 'green' },
    { id: NODE_IDS.L, xPercent: 0.79, yPercent: 0.34, type: 'yellow' },
    { id: NODE_IDS.M, xPercent: 0.93, yPercent: 0.34, type: 'green' }
];

var links = [
    { source: NODE_IDS.A, target: NODE_IDS.D },
    { source: NODE_IDS.B, target: NODE_IDS.D },
    { source: NODE_IDS.B, target: NODE_IDS.E },
    { source: NODE_IDS.C, target: NODE_IDS.E },
    { source: NODE_IDS.D, target: NODE_IDS.F },
    { source: NODE_IDS.E, target: NODE_IDS.G },
    { source: NODE_IDS.F, target: NODE_IDS.H },
    { source: NODE_IDS.G, target: NODE_IDS.I },
    { source: NODE_IDS.H, target: NODE_IDS.J },
    { source: NODE_IDS.I, target: NODE_IDS.K },
    { source: NODE_IDS.J, target: NODE_IDS.L },
    { source: NODE_IDS.K, target: NODE_IDS.L },
    { source: NODE_IDS.L, target: NODE_IDS.M }
];

if(nodeData.data.name=='Distance to City or Settlement'){
 // Node Definitions
  NODE_IDS = {
    A: 'Study Area Grids',
    B: 'Built Settlement',
    C: 'City Distance Zonal Statistics',
    D: 'Distance to Cities',
    E: 'Rescale Distance Linearly',
    F: 'Distance to Cities Rescale',
    G: 'Weighted Sum',
    H: 'City Distance'
};

 nodes = [
    { id: NODE_IDS.A, xPercent: 0.07, yPercent: 0.15, type: 'blue' },
    { id: NODE_IDS.B, xPercent: 0.07, yPercent: 0.35, type: 'blue' },
    { id: NODE_IDS.C, xPercent: 0.21, yPercent: 0.25, type: 'yellow' },
    { id: NODE_IDS.D, xPercent: 0.36, yPercent: 0.25, type: 'green' },
    { id: NODE_IDS.E, xPercent: 0.5, yPercent: 0.25, type: 'yellow' },
    { id: NODE_IDS.F, xPercent: 0.64, yPercent: 0.25, type: 'green' },
    { id: NODE_IDS.G, xPercent: 0.79, yPercent: 0.25, type: 'yellow' },
    { id: NODE_IDS.H, xPercent: 0.93, yPercent: 0.35, type: 'green' }
];

// Link Definitions
 links = [
    { source: NODE_IDS.A, target: NODE_IDS.C },
    { source: NODE_IDS.B, target: NODE_IDS.C },
    { source: NODE_IDS.C, target: NODE_IDS.D },
    { source: NODE_IDS.D, target: NODE_IDS.E },
    { source: NODE_IDS.E, target: NODE_IDS.F },
    { source: NODE_IDS.F, target: NODE_IDS.G },
    { source: NODE_IDS.G, target: NODE_IDS.H }
];
}

// Define and render the SVG content
defineArrowhead(svgContainer); // Adds arrowhead definitions
drawNodes(svgContainer, nodes, 1400, 400); // Draws nodes
drawLinks(svgContainer, links, nodes, 1400, 400); // Draws links
addLabels(svgContainer, nodes, 1400, 400); // Adds labels

// Return the generated SVG as a string
return svgContainer.node().outerHTML;
    }

    // function propagateGreenFromRoot(rootNodeId) {
    //     // Function to find all child nodes of a given nodeId
    //     function getChildrenIds(nodeId) {
    //         const children = [];
    //         svg.selectAll("rect").each(function (d) {
    //             if (d.parent && d.parent.data.id === nodeId) {
    //                 children.push(d.data.id);
    //             }
    //         });
    //         return children;
    //     }
    
    //     // Function to check if all child nodes of a given nodeId are green
    //     function areAllChildrenGreen(nodeId) {
    //         const children = getChildrenIds(nodeId);
    //         return children.every(childId => {
    //             const rect = d3.select("#" + childId);
    //             return rect.style("fill") === "green";
    //         });
    //     }
    
    //     // Recursive function to check and propagate green from the root
    //     function checkAndPropagate(nodeId) {
    //         const children = getChildrenIds(nodeId);
    
    //         // Recursively check all children first
    //         children.forEach(childId => checkAndPropagate(childId));
    
    //         // If all children are green, make this node green
    //         if (areAllChildrenGreen(nodeId)) {
    //             d3.select("#" + nodeId).style("fill", "green");
    //         }
    //     }
    
    //     // Start the propagation from the root
    //     checkAndPropagate(rootNodeId);
    // }
    // propagateGreenFromRoot(root);


}

// Assign update function globally
update = updateTree;


export function changeNodeColor(elementId) {
    nodeId = elementId;
    initializeFlowchart(elementId);
};
