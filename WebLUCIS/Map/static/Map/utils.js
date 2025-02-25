export function defineArrowhead(svg) {
  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "black");
}

// Function to calculate absolute positions from percentages
function getPosition(percent, total) {
  return percent * total;
}

// Function to draw nodes (both ellipses and rectangles)
export function drawNodes(svg, nodes, svgWidth, svgHeight) {
  // Ellipse nodes (non-yellow nodes)
  svg.selectAll(".ellipse")
    .data(nodes.filter(d => d.type !== 'yellow'))
    .enter()
    .append("ellipse")
    .attr("class", d => `node ${d.type}`)
    .attr("id", d => `ellipse-${d.id}`) // Assign unique ID
    .attr("cx", d => getPosition(d.xPercent, svgWidth))
    .attr("cy", d => getPosition(d.yPercent, svgHeight))
    .attr("rx", 80)
    .attr("ry", 40);

  // Rectangular nodes (yellow nodes)
  svg.selectAll(".rect")
    .data(nodes.filter(d => d.type === 'yellow'))
    .enter()
    .append("rect")
    .attr("class", d => `node ${d.type}`)
    .attr("id", d => `rect-${d.id}`) // Assign unique ID
    .attr("x", d => getPosition(d.xPercent, svgWidth) - 100)
    .attr("y", d => getPosition(d.yPercent, svgHeight) - 40)
    .attr("width", 200)
    .attr("height", 80)
    .attr("rx", 20)
    .attr("ry", 20);
}
// Function to draw links (lines with arrows)
export function drawLinks(svg, links, nodes, svgWidth, svgHeight) {
  svg.selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", d => getPosition(nodes.find(n => n.id === d.source).xPercent, svgWidth) + 80)
    .attr("y1", d => getPosition(nodes.find(n => n.id === d.source).yPercent, svgHeight))
    .attr("x2", d => getPosition(nodes.find(n => n.id === d.target).xPercent, svgWidth) - 80)
    .attr("y2", d => getPosition(nodes.find(n => n.id === d.target).yPercent, svgHeight))
    .attr("marker-end", "url(#arrowhead)");
}


// export function addLabels(svg, nodes, svgWidth, svgHeight) {
//   const padding = 20; // Define padding around the text

//   svg.selectAll(".text")
//     .data(nodes)
//     .enter()
//     .append("text")
//     .attr("x", d => getPosition(d.xPercent, svgWidth))
//     .attr("y", d => getPosition(d.yPercent, svgHeight))
//     .attr("text-anchor", "middle")
//     .attr("dy", ".35em")
//     .each(function(d) {
//       const textElement = d3.select(this);
//       const words = d.id.split(' ');
//       let line = '';
//       let lineNumber = 0;
//       const lineHeight = 1.1; // ems

//       // Get the parent ellipse width dynamically
//       const parentNode = svg.select(`#ellipse-${d.id}`).node();
//       const parentBBox = parentNode ? parentNode.getBBox() : { width: 70 };
//       const maxWidth = parentBBox.width - 2 * padding; // Subtract padding from both sides

//       words.forEach((word, index) => {
//         const testLine = line + word + ' ';
//         const tempTspan = textElement.append("tspan").text(testLine);
//         const metrics = tempTspan.node().getComputedTextLength();

//         // If the text exceeds the available width, break the line
//         if (metrics > maxWidth && line.length > 0) {
//           tempTspan.remove();
//           textElement.append("tspan")
//             .attr("x", getPosition(d.xPercent, svgWidth))
//             .attr("dy", lineNumber === 0 ? 0 : lineHeight + "em")
//             .text(line.trim());
//           line = word + ' ';
//           lineNumber++;
//         } else {
//           tempTspan.remove();
//           line = testLine;
//         }

//         // Append the last line after iterating through the words
//         if (index === words.length - 1) {
//           textElement.append("tspan")
//             .attr("x", getPosition(d.xPercent, svgWidth))
//             .attr("dy", lineNumber === 0 ? 0 : lineHeight + "em")
//             .text(line.trim());
//         }
//       });
//     });
// }

export function addLabels(svg, nodes, svgWidth, svgHeight) {
  const padding = 25; // Padding around text

  svg.selectAll(".text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "text")
    .attr("x", d => getPosition(d.xPercent, svgWidth))
    .attr("y", d => getPosition(d.yPercent, svgHeight))
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .each(function (d) {
      const textElement = d3.select(this);
      const words = d.id.split(" ");
      const lineHeight = 1.1; // Line height in ems
      let lineNumber = 0;
      let line = "";

      // Determine parent shape's bounding box (ellipse or rectangle)
      const parentNode = svg.select(`#ellipse-${d.id}`).node() || svg.select(`#rect-${d.id}`).node();
      console.log(parentNode);
      const parentBBox = parentNode ? parentNode.getBBox() : { width: 100, height: 50 };
      const maxWidth = parentBBox.width - 2 * padding;
      const maxHeight = parentBBox.height - 2 * padding;

      words.forEach((word, index) => {
        const testLine = line + word + " ";
        const tempTspan = textElement.append("tspan").text(testLine);
        const metrics = tempTspan.node().getComputedTextLength();

        if (metrics > maxWidth && line.length > 0) {
          tempTspan.remove();
          textElement.append("tspan")
            .attr("x", getPosition(d.xPercent, svgWidth))
            .attr("dy", lineNumber === 0 ? 0 : lineHeight + "em")
            .text(line.trim());
          line = word + " ";
          lineNumber++;
        } else {
          tempTspan.remove();
          line = testLine;
        }

        if (index === words.length - 1) {
          textElement.append("tspan")
            .attr("x", getPosition(d.xPercent, svgWidth))
            .attr("dy", lineNumber === 0 ? 0 : lineHeight + "em")
            .text(line.trim());
        }
      });

      // Adjust vertical position to center the text block
      const numLines = lineNumber + 1;
      const textHeight = numLines * lineHeight * 10; // Approximate height in pixels
      const verticalOffset = Math.min(maxHeight / 2, textHeight / 2);

      textElement.attr("y", getPosition(d.yPercent, svgHeight) - verticalOffset);
    });
}
