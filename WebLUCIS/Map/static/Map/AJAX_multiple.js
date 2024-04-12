var geojsonData;
const { DeckGL, GeoJsonLayer } = deck;
var suitabilityvalue;
var deckgl = new DeckGL({
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    initialViewState: {
        latitude: 8.020501,
        longitude: -2.206687,
        zoom: 5.85,
        maxZoom: 16,
        pitch: 0
    },
    controller: true,
    // getTooltip
    layers: []
});



// Function to handle form submission
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// function populateColorScaleOptions(colorScales) {
//     const selectElement = document.getElementById('colorScaleSelect'); // Assuming you have a <select> element with this ID
//     Object.keys(colorScales).forEach(scaleName => {
//         const option = document.createElement('option');
//         option.value = scaleName;
//         option.textContent = scaleName;
//         selectElement.appendChild(option);
//     });

//     // Add event listener to update the visualization when the color scale is changed
//     selectElement.addEventListener('change', function () {
//         const selectedScale = colorScales[this.value];
//         updateVisualizationWithColorScale(selectedScale); // Implement this function based on your visualization tool
//     });
// }

// function generateColorPalettes(colorScales) {
//     var colorType = document.getElementById('color-type-select').value;
//     var container = document.getElementById('color-palette-container');
//     container.innerHTML = '';

//     // Function to create a color div
//     function createColorDiv(color) {
//         var colorDiv = document.createElement('div');
//         colorDiv.className = 'color';
//         colorDiv.style.backgroundColor = color;
//         return colorDiv;
//     }

//     // Function to generate a row for each color scale
//     function generatePaletteRow(scaleName) {
//         var rowDiv = document.createElement('div');
//         rowDiv.className = 'palette-row';
//         var colors = colorScales[scaleName];

//         colors.forEach(([position, color]) => {
//             rowDiv.appendChild(createColorDiv(color));
//         });

//         rowDiv.addEventListener('click', function () {
//             // Here, implement what happens when a row is clicked
//             // For example, you might want to update a map or chart with the selected color scale
//             console.log(`Color scale ${scaleName} selected`);
//         });

//         return rowDiv;
//     }

//     // Add rows for the selected color scale type
//     Object.keys(colorScales).forEach(scaleName => {
//         if (colorType === 'all' || scaleName.includes(colorType)) {
//             container.appendChild(generatePaletteRow(scaleName));
//         }
//     });
// }
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
                var displayedColors = colors.slice(0, steps);
                rowDiv.displayedColors = displayedColors;

                displayedColors.forEach(([position, color]) => {
                    rowDiv.appendChild(createColorDiv(color));
                });

                rowDiv.addEventListener('click', function () {
                    console.log(`Color scale ${scaleName} selected`);
                    let intervals = calculateIntervals(geojsonData, this.displayedColors.length);
                    updateMapColors(intervals, this.displayedColors.map(colorInfo => colorInfo[1]));
                });
                return rowDiv;
            }

            // Filter scales based on the selected type and generate rows
            Object.keys(fetchedColorScales).forEach(scaleName => {
                // This assumes you have a way to determine if a scaleName belongs to a type
                if (colorType === 'all') {
                    let colors = fetchedColorScales[scaleName];
                    container.appendChild(generatePaletteRow(scaleName, colors));
                }
            });
        })
        .catch(error => console.error("Failed to load color scales", error));
}



$("#step-input").change(function () {
    generateColorPalettes();
})
$("#color-type-select").change(function () {
    generateColorPalettes();
})

function addRow() {
    var rowCount = parseInt($('#rowcount').val());
    var totalRows = $('#dataTable tbody tr').length;

    if (totalRows < rowCount) {
        var newRow = $('<tr><td><input type="number" name="start[]" /></td><td><input type="number" name="end[]" /></td><td><input type="number" name="new[]" /></td></tr>');
        $('#dataTable tbody').append(newRow);
    }
}

function calculateIntervals(data, steps) {
    let values = data.features.map(f => f.properties.pop);
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
function updateMapColors(intervals, colors) {
    // Assign a color to each interval
    debugger

    let intervalColors = intervals.map((interval, index) => ({
        ...interval,
        color: colors[index % colors.length] // Cycle through colors if not enough
    }));

    // Add a color property to each feature based on its interval
    geojsonData.features.forEach(feature => {
        let value = feature.properties.pop;
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
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

function updatemap(response) {
    $("#mapcontroldiv").css("display", "block");
    geojsonData = JSON.parse(response.result);
    generateColorPalettes();
    const geojsonLayer = new GeoJsonLayer({
        data: geojsonData,
        opacity: 0.8,
        stroked: true,
        filled: true,
        extruded: false,
        wireframe: false,
        lineWidthMinPixels: 0, // Minimum width of stroke lines
        getLineColor: [255, 0, 0], // Set stroke color to red
        getFillColor: [0, 255, 0], // Set fill color to green
        getLineWidth: 1, // Set stroke width
        pickable: true
    });
    deckgl.setProps({ layers: [geojsonLayer] });
}



$("#choose").change(function () {
    var formid = $(this).val();
    $("form[id^='suitability_form'], form[id^='district_form']").css("display", "none");
    $("#" + formid).css("display", "block");
})
$(document).on('input', '#dataTable input', function () {
    var lastRow = $('#dataTable tbody tr:last');
    var inputs = lastRow.find('input');
    var filled = true;
    inputs.each(function () {
        if ($(this).val().trim() === '') {
            filled = false;
            return false; // Exit the loop early if any input is empty
        }
    });
    if (filled) {
        addRow();
    }
});

$(document).on('input', '#dataTable input', function () {
    var row = $(this).closest('tr');
    var inputs = row.find('input');
    var empty = true;
    inputs.each(function () {
        if ($(this).val().trim() !== '') {
            empty = false;
            return false; // Exit the loop early if any input is not empty
        }
    });
    if (empty && row.index() !== 0) {
        row.remove();
    }
});

$('#show-suitability-btn').click(function () {
    // Serialize form data

    suitabilityvalue = $('#field_select').val();

    var csrftoken = getCookie('csrftoken');
    // Send AJAX request
    $.ajax({
        type: 'POST',
        url: '/fetch_suitability/',
        data: { suitabilityvalue: suitabilityvalue },
        headers: {
            'X-CSRFToken': csrftoken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (response) {
            updatemap(response);

        },
        error: function (xhr, status, error) {
            // Handle error
            console.error(error);
        }
    });
});

$('#district_form,#buffer_form').submit(function (e) {
    e.preventDefault();

    // Create FormData object for district_form
    const formDataDistrict = new FormData(document.getElementById('district_form'));

    // Get the buffer_form and append its data to formDataDistrict
    const bufferForm = document.getElementById('buffer_form');

    const formDataBuffer = new FormData(bufferForm);
    // Append formDataBuffer to formDataDistrict
    for (const [key, value] of formDataBuffer.entries()) {
        formDataDistrict.append(key, value);
    }

    fetch('/submit_form/', {
        method: 'POST',
        body: formDataDistrict,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            $(".color-range-palette").css("display", "flex");

            geojsonData = JSON.parse(data.result);
            const geojsonLayer = new GeoJsonLayer({
                data: geojsonData,
                opacity: 0.8,
                stroked: true,
                filled: true,
                extruded: false,
                wireframe: false,
                lineWidthMinPixels: 1, // Minimum width of stroke lines
                // getLineColor: [255, 0, 0], // Set stroke color to red
                getFillColor: [0, 255, 0], // Set fill color to green
                getLineWidth: 1, // Set stroke width
                pickable: true
            });
            deckgl.setProps({ layers: [geojsonLayer] });

        })
        .catch(error => {
            console.error('Error:', error);
        });
});

