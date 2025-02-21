
var initialColors = [
    "rgb(36, 86, 104)",
    "rgb(15, 114, 121)",
    "rgb(13, 143, 129)",
    "rgb(57, 171, 126)",
    "rgb(110, 197, 116)",
    "rgb(169, 220, 103)"
];
initialColors.reverse();

$(document).on("click", "#selectedcolorpalette", function () {
    $(".colorpalettediv").toggle();
});
$(document).on("change", "#intervalMethod", function () {
    updatemap(geojsonData);
});

function generateColorPalettes() {
    // Fetch the categorized color scales from your JSON file
    fetch('/static/Map/plotly_color_scales.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(fetchedColorScales => {
            // Assume fetchedColorScales is your object of color scales

            // Get selected color type and steps from the DOM
            var colorType = document.getElementById('color-type-select').value.toLowerCase();
            var steps = parseInt(document.getElementById('step-input').value) || 5; // Default to 5 steps if undefined
            var container = document.getElementById('color-palette-container');
            container.innerHTML = '';

            // Function to create a color div
            function createColorDiv(color) {
                var colorDiv = document.createElement('div');
                colorDiv.className = 'color';
                colorDiv.style.backgroundColor = color;
                return colorDiv;
            }


            // Function to generate a row for each color scale
            function generatePaletteRow(scaleName, colors) {

                var rowDiv = document.createElement('div');
                rowDiv.className = 'palette-row';

                // If the number of steps is less than the colors length, slice the array
                var middleIndex = Math.floor(colors.length / 2);
                var removeCount = colors.length - steps;

                // Determine the start and end indices for slicing out the middle
                var startIndex = middleIndex - Math.floor(removeCount / 2);
                var endIndex = startIndex + removeCount;

                // Remove the middle colors
                var displayedColors = colors.slice(0, startIndex).concat(colors.slice(endIndex));
                rowDiv.displayedColors = displayedColors;

                displayedColors.forEach(([position, color]) => {
                    rowDiv.appendChild(createColorDiv(color));
                });

                rowDiv.addEventListener('click', function () {
                    $(".palette-row").removeClass("selected");
                    $(this).addClass("selected");
                    $("#selectedcolorpalette").empty();
                    displayedColors.forEach(([position, color]) => {
                        // Create a color div for each color
                        let colorDiv = createColorDiv(color);
                        // Append the color div to the selectedcolorpalette element
                        $("#selectedcolorpalette").append(colorDiv);
                    });
                    selectedcolors = this.displayedColors.map(colorInfo => colorInfo[1]);
                    let intervals = calculateIntervals(geojsonData, this.displayedColors.length);
                    updateMapColors(intervals, this.displayedColors.map(colorInfo => colorInfo[1]));
                });
                return rowDiv;
            }
            const diverging = [
                'armyrose', 'earth', 'fall', 'geyser', 'picnic', 'portland', 'puor', 'rainbow',
                'rdgy', 'spectral', 'tealrose', 'temps', 'electric', 'inferno', 'jet', 'tropic',
                'balance', 'curl', 'delta', 'oxy', 'edge', 'hsv', 'icefire', 'phase', 'twilight',
                'mrybm', 'mygbm'
            ];

            const singlehue = [
                'blues', 'greens', 'greys', 'oranges', 'purples', 'reds', 'brbg', 'prgn',
                'piyg', 'rdylbu', 'rdylgn'
            ];

            const sequential = [
                'aggrnyl', 'agsunset', 'blackbody', 'bluered', 'blugrn', 'bluyl', 'brwnyl',
                'bugn', 'bupu', 'burg', 'burgyl', 'cividis', 'darkmint', 'emrld', 'gnbu',
                'hot', 'magma', 'mint', 'orrd', 'oryel', 'peach', 'pinkyl', 'plasma', 'pubu',
                'pubugn', 'purd', 'purp', 'purpor', 'sunset', 'sunsetdark', 'tealgrn', 'turbo',
                'viridis', 'ylgn', 'ylgnbu', 'ylorbr', 'ylorrd', 'deep', 'dense', 'haline',
                'matter', 'solar', 'speed', 'tempo', 'thermal', 'turbid', 'magenta', 'teal',
                'algae', 'gray', 'ice'
            ];

            // Filter scales based on the selected type and generate rows
            Object.keys(fetchedColorScales).forEach(scaleName => {
                let colors = fetchedColorScales[scaleName];
                if (colors.length < steps) {
                }
                else {
                    // This assumes you have a way to determine if a scaleName belongs to a type
                    if (colorType === 'all') {
                        container.appendChild(generatePaletteRow(scaleName, colors));
                    }
                    else if (colorType === 'diverging' && diverging.includes(scaleName)) {
                        container.appendChild(generatePaletteRow(scaleName, colors));
                    }
                    else if (colorType === 'sequential' && sequential.includes(scaleName)) {
                        container.appendChild(generatePaletteRow(scaleName, colors));
                    }
                    else if (colorType === 'singlehue' && singlehue.includes(scaleName)) {
                        container.appendChild(generatePaletteRow(scaleName, colors));
                    }
                }


            });
        })
        .catch(error => console.error("Failed to load color scales", error));
}


$(document).on("change", "#step-input", function () {
    generateColorPalettes();
})
$(document).on("change", "#color-type-select", function () {
    generateColorPalettes();
})

function calculateIntervals(data, steps) {
    let values = data.features.map(f => f.properties[selectedWord.toLowerCase()]);
    let max = values[0];
    let min = values[0];

    // Iterate through values to find max and min
    for (let i = 1; i < values.length; i++) {
        if (values[i] > max) {
            max = values[i];
        }
        if (values[i] < min) {
            min = values[i];
        }
    }
    let range = max - min;
    let intervalSize = range / steps;
    let intervals = [];
    for (let i = 0; i < steps; i++) {
        intervals.push([min + i * intervalSize, min + (i + 1) * intervalSize]);
    }
    return intervals;
}
function calculateQuantileIntervals(data, steps) {
    let values = data.features.map(f => f.properties[selectedWord.toLowerCase()]);

    // Sort the values
    values.sort((a, b) => a - b);

    // Calculate quantiles
    let intervals = [];
    for (let i = 0; i < steps; i++) {
        let start = Math.floor(i * values.length / steps);
        let end = Math.floor((i + 1) * values.length / steps) - 1;
        intervals.push([values[start], values[end]]);
    }
    return intervals;
}


function updateMapColors(intervals, colors) {
    // Assign a color to each interval
    let intervalColors = intervals.map((interval, index) => ({
        ...interval,
        color: colors[index % colors.length] // Cycle through colors if not enough
    }));

    // Add a color property to each feature based on its interval
    geojsonData.features.forEach(feature => {
        let value = feature.properties[selectedWord.toLowerCase()];
        let intervalColor = intervalColors.find(ic => value >= ic[0] && value < ic[1]);
        if (intervalColor) {
            // Convert HSL to RGB if necessary, or directly use the color
            feature.properties.color = intervalColor.color;
        }
    });
    const uniqueLayerId = `geojson-layer-${Date.now()}`;
    const geojsonLayer = new GeoJsonLayer({
        id: uniqueLayerId, // Unique identifier for the layer
        data: geojsonData, // Your GeoJSON data
        opacity: 0.8,
        stroked: false,
        filled: true,
        extruded: false,
        wireframe: false,
        pickable: true,
        getFillColor: feature => {
            // Extracting HSL values from the 'color' property
            const colorProp = feature.properties.color;

            if (!colorProp) {
                // Default color if no color is specified
                return [255, 255, 255, 255]; // White with full opacity
            }

            // Check for RGB format
            const rgbMatch = colorProp.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
            if (rgbMatch) {
                return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]), 255]; // Assuming full opacity
            }

            // Check for hexadecimal format
            if (colorProp[0] === '#') {
                // Convert hex to RGB
                let hex = colorProp.substring(1); // Remove '#'
                if (hex.length === 3) {
                    // Convert shorthand hex color to full
                    hex = hex.split('').map(char => char + char).join('');
                }
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return [r, g, b, 255]; // Assuming full opacity
            }

            // Fallback color if the format is not recognized
            return [255, 255, 255, 0]; // Transparent
        },
    });

    // Updating the DeckGL instance with the new layer
    deckgl.setProps({ layers: [geojsonLayer] });
    updateLegend(intervals, colors);
}
function updatemap(response, formUrl) {
    var bufferButton = document.querySelector('button[data-tab="Buffer"]');
    // Dynamically assign the selected column based on the form URL
    selectedWord = formColumns[formUrl];
    if (!selectedWord) {
        console.error(`Form URL "${formUrl}" not found in the mapping.`);
        return;
    }
    // Trigger the click event on the "Buffer" button
    bufferButton.click();
    $(`.tablinks[data-tab="Buffer"]`).addClass('active');
    geojsonData = response;
    generateColorPalettes();
    let intervalmethod = $("#intervalMethod").val();
    let intervals;
    if (intervalmethod === 'quantify') {
        intervals = calculateIntervals(geojsonData, 6);
    } else if (intervalmethod === 'quantile') {
        intervals = calculateQuantileIntervals(geojsonData, 6);
    }
    if (selectedcolors == undefined)
        updateMapColors(intervals, initialColors);
    else
        updateMapColors(intervals, selectedcolors);
}

function updateLegend(intervals, colors) {
    const legendContainer = $('#legend');
    legendContainer.css('display', 'block');
    legendContainer.empty(); // Clear existing legend items

    if (intervals && colors) {
        intervals.forEach((interval, index) => {
            const legendItem = $('<div>').addClass('legend-item');

            const colorBox = $('<div>')
                .addClass('legend-color')
                .css('background-color', colors[index % colors.length]); // Cycle through colors if not enough
            legendItem.append(colorBox);

            // Create a label that displays the interval range
            const label = $('<span>').text(`${interval[0].toFixed(2)} - ${interval[1].toFixed(2)}`); // Displaying intervals as a string
            legendItem.append(label);

            legendContainer.append(legendItem);
        });
    }
}