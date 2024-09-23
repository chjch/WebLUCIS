var geojsonData;
const { DeckGL, GeoJsonLayer } = deck;
var suitabilityvalue = "";
var words;
var selectedcolors;
var selectedWord;
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

var initialColors = [
    "rgb(36, 86, 104)",
    "rgb(15, 114, 121)",
    "rgb(13, 143, 129)",
    "rgb(57, 171, 126)",
    "rgb(110, 197, 116)",
    "rgb(169, 220, 103)"
];
$(".progress-container").css('display', 'none');


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

$("#selectedcolorpalette").on("click", function () {
    $(".colorpalettediv").toggle();
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
                'armyrose',
                'earth',
                'fall',
                'geyser',
                'picnic',
                'portland',
                'puor',
                'rainbow',
                'rdgy',
                'spectral',
                'tealrose',
                'temps',
                'electric',
                'inferno',
                'jet',
                'tropic',
                'balance',
                'curl',
                'delta',
                'oxy',
                'edge',
                'hsv',
                'icefire',
                'phase',
                'twilight',
                'mrybm',
                'mygbm'
            ];
            const singlehue = [
                'blues',
                'greens',
                'greys',
                'oranges',
                'purples',
                'reds',
                'brbg',
                'prgn',
                'piyg',
                'rdylbu',
                'rdylgn'
            ];
            const qualitative = [

            ]
            const sequential = [
                'aggrnyl',
                'agsunset',
                'blackbody',
                'bluered',
                'blugrn',
                'bluyl',
                'brwnyl',
                'bugn',
                'bupu',
                'burg',
                'burgyl',
                'cividis',
                'darkmint',
                'emrld',
                'gnbu',
                'hot',
                'magma',
                'mint',
                'orrd',
                'oryel',
                'peach',
                'pinkyl',
                'plasma',
                'pubu',
                'pubugn',
                'purd',
                'purp',
                'purpor',
                'sunset',
                'sunsetdark',
                'tealgrn',
                'turbo',
                'viridis',
                'ylgn',
                'ylgnbu',
                'ylorbr',
                'ylorrd',
                'deep',
                'dense',
                'haline',
                'matter',
                'solar',
                'speed',
                'tempo',
                'thermal',
                'turbid',
                'magenta',
                'teal',
                'algae',
                'gray',
                'ice'
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
    let values = data.map(f => f.properties[selectedWord.toLowerCase()]);
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
    let values = data.map(f => f.properties[selectedWord.toLowerCase()]);

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
    geojsonData.forEach(feature => {
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
}


function updatemap(response) {
    $("#mapcontroldiv").css("display", "block");
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
function transformToGeoJSON(data) {
    return data.map((item, index) => ({
        id: index.toString(),
        type: "Feature",
        properties: {
            [selectedWord.toLowerCase()]: item[selectedWord.toLowerCase()]
        },
        geometry: JSON.parse(item.geomm)
    }));
}
$("#show-suitability-btn").click(function () {
    suitabilityvalue = $('#field_select').val();
    selectedWord = suitabilityvalue.toLowerCase().replace(/\s+/g, '_');
    // words = suitabilityvalue.trim().split(' ');
    // selectedWord = words.length > 1 ? words[1] : words[0];


    var csrftoken = getCookie('csrftoken');
    // Display the progress bar
    var $progressBarContainer = $(".progress-container");
    var $progressBar = $("#progress-bar");
    $progressBarContainer.show();
    var width = 1;

    // Fake progress bar simulation
    var fakeProgressInterval = setInterval(function () {
        if (width >= 85) { // Cap the fake progress at 90%
            clearInterval(fakeProgressInterval);
        } else {
            width++;
            $progressBar.css("width", width + '%');
        }
    }, 500); // Update progress every 100ms
    let apiUrl = `/api/suitability/${selectedWord}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // or response.text() if the response is not in JSON format
        })
        .then(data => {
            const new_geojsonData = transformToGeoJSON(data);
            updatemap(new_geojsonData);
            // Clear the fake progress interval
            clearInterval(fakeProgressInterval);
            // Update the progress bar with the actual data loading progress
            var actualProgress = 85; // Start from where the fake progress left off
            var actualProgressInterval = setInterval(function () {
                if (actualProgress >= 100) {
                    clearInterval(actualProgressInterval);
                    // Hide the progress bar container
                    $progressBarContainer.hide();
                    // Reset the progress bar
                    $progressBar.css("width", '0%');
                } else {
                    actualProgress++;
                    $progressBar.css("width", actualProgress + '%');
                }
            }, 20);

        })
        .catch(error => {
            clearInterval(fakeProgressInterval);
            $progressBarContainer.hide();
            console.error('There has been a problem with your fetch operation:', error);
        });
    // $.ajax({
    //     type: 'POST',
    //     url: '/fetch_suitability/',
    //     data: { suitabilityvalue: selectedWord },
    //     headers: {
    //         'X-CSRFToken': csrftoken,
    //         'X-Requested-With': 'XMLHttpRequest'
    //     },
    //     success: function (response) {
    //         console.log(response)
    //         const new_geojsonData = transformToGeoJSON(response.result);
    //         updatemap(new_geojsonData);
    //         // Clear the fake progress interval
    //         clearInterval(fakeProgressInterval);
    //         // Update the progress bar with the actual data loading progress
    //         var actualProgress = 85; // Start from where the fake progress left off
    //         var actualProgressInterval = setInterval(function () {
    //             if (actualProgress >= 100) {
    //                 clearInterval(actualProgressInterval);
    //                 // Hide the progress bar container
    //                 $progressBarContainer.hide();
    //                 // Reset the progress bar
    //                 $progressBar.css("width", '0%');
    //             } else {
    //                 actualProgress++;
    //                 $progressBar.css("width", actualProgress + '%');
    //             }
    //         }, 20); // Update progress every 20ms
    //     },
    //     error: function (xhr, status, error) {
    //         console.error(error);
    //         // Handle error
    //         clearInterval(fakeProgressInterval);
    //         $progressBarContainer.hide();
    //     }
    // });
});
// commenting to implement the next button 
// $('#district_form,#buffer_form').submit(function (e) {
//     e.preventDefault();
//     debugger

//     // Create FormData object for district_form
//     const formDataDistrict = new FormData(document.getElementById('district_form'));

//     // Get the buffer_form and append its data to formDataDistrict
//     const bufferForm = document.getElementById('buffer_form');

//     const formDataBuffer = new FormData(bufferForm);
//     // Append formDataBuffer to formDataDistrict
//     for (const [key, value] of formDataBuffer.entries()) {
//         formDataDistrict.append(key, value);
//     }

//     fetch('/submit_form/', {
//         method: 'POST',
//         body: formDataDistrict,
//         headers: {
//             'X-CSRFToken': getCookie('csrftoken'),
//             'X-Requested-With': 'XMLHttpRequest'
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             // Handle the response data
//             $(".color-range-palette").css("display", "flex");

//             geojsonData = JSON.parse(data.result);
//             const geojsonLayer = new GeoJsonLayer({
//                 data: geojsonData,
//                 opacity: 0.8,
//                 stroked: true,
//                 filled: true,
//                 extruded: false,
//                 wireframe: false,
//                 lineWidthMinPixels: 1, // Minimum width of stroke lines
//                 // getLineColor: [255, 0, 0], // Set stroke color to red
//                 getFillColor: [0, 255, 0], // Set fill color to green
//                 getLineWidth: 1, // Set stroke width
//                 pickable: true
//             });
//             deckgl.setProps({ layers: [geojsonLayer] });

//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// });



const data = {
    "Urban": {
        "General": {
            "Physical": [
                "Existing Land Use",
                "Development Constraints",
                "Population Density"
            ],
            "Proximity": [
                "Road Accessibility",
                "Distance to City/Settlement"
            ]
        }
    },
    "Agriculture": {
        "Crop Farming": {
            "Physical": [
                "Soil Condition",
                "Terrain Characteristics",
                "Existing Land Use",
                "Development Constraints"
            ],
            "Proximity": [
                "Proximity to Water",
                "Road Accessibility",
                "Proximity to Market",
                "Proximity to Existing Crop Farms"
            ]
        },
        "Livestock": {
            "Physical": [
                "Terrain Characteristics",
                "Existing Land Use",
                "Development Constraints"
            ],
            "Proximity": [
                "Proximity to Water",
                "Road Accessibility"
            ]
        }
    },
    "Conservation": {
        "Biodiversity": [
            "Biomass",
            "Forest Cover"
        ],
        "Water Quality": [
            "Underground Water Quality",
            "Surface Water"
        ],
        "Ecological Processes": [
            "Wetlands",
            "Rivers",
            "Open Waters"
        ],
        "Recreation": [
            "National Parks"
        ],
        "Enhancing Existing Conservation Area": {
            "Resource Reserve": [],
            "Wildlife Sanctuary": [],
            "Natural Reserve": {
                "Strict Nature Reserve": [],
                "Forest Reserve": []
            }
        }
    }
};

function updateSubcategory() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory");
    const objective = document.getElementById("objective");
    const details = document.getElementById("details");
    const subcategoryLabel = document.querySelector('label[for="subcategory"]');
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("tab2");

    subcategory.innerHTML = '<option value="">Select...</option>';
    objective.innerHTML = '<option value="">Select...</option>';
    details.innerHTML = '<option value="">Select...</option>';

    if (category) {
        subcategoryLabel.classList.remove("hidden");
        subcategory.classList.remove("hidden");
        objectiveLabel.classList.add("hidden");
        objective.classList.add("hidden");
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
        nextButton.classList.add("hidden");

        const subcategories = Object.keys(data[category]);
        subcategories.forEach(subcat => {
            subcategory.innerHTML += `<option value="${subcat}">${subcat}</option>`;
        });
    } else {
        subcategoryLabel.classList.add("hidden");
        subcategory.classList.add("hidden");
        objectiveLabel.classList.add("hidden");
        objective.classList.add("hidden");
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
        nextButton.classList.add("hidden");
    }
}

function updateObjective() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective");
    const details = document.getElementById("details");
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("tab2");

    objective.innerHTML = '<option value="">Select...</option>';
    details.innerHTML = '<option value="">Select...</option>';

    if (category && subcategory) {
        objectiveLabel.classList.remove("hidden");
        objective.classList.remove("hidden");
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
        nextButton.classList.add("hidden");

        const objData = data[category][subcategory];
        if (Array.isArray(objData)) {
            objData.forEach(obj => {
                objective.innerHTML += `<option value="${obj}">${obj}</option>`;
            });
        } else if (typeof objData === 'object') {
            const objectives = Object.keys(objData);
            objectives.forEach(obj => {
                objective.innerHTML += `<option value="${obj}">${obj}</option>`;
            });
        }
    } else {
        objectiveLabel.classList.add("hidden");
        objective.classList.add("hidden");
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
        nextButton.classList.add("hidden");
    }
}

function updateDetails() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective").value;
    const details = document.getElementById("details");
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("tab2");

    details.innerHTML = '<option value="">Select...</option>';

    if (category && subcategory && objective) {
        const objData = data[category][subcategory][objective];
        if (objData !== undefined) {
            if (objData.length !== 0) {
                detailsLabel.classList.remove("hidden");
                details.classList.remove("hidden");

                if (Array.isArray(objData)) {
                    objData.forEach(detail => {
                        details.innerHTML += `<option value="${detail}">${detail}</option>`;
                    });
                } else if (typeof objData === 'object') {
                    const nestedDetails = Object.keys(objData);
                    nestedDetails.forEach(detail => {
                        details.innerHTML += `<option value="${detail}">${detail}</option>`;
                    });
                    nextButton.classList.add("hidden");
                } else {
                    detailsLabel.classList.add("hidden");
                    details.classList.add("hidden");
                }
            }
            else {
                detailsLabel.classList.add("hidden");
                details.classList.add("hidden");
                nextButton.classList.remove("hidden");
            }
        }
        else {
            detailsLabel.classList.add("hidden");
            details.classList.add("hidden");
            nextButton.classList.remove("hidden");
        }

    } else {
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
    }
}
function checkNextButton() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective").value;
    const details = document.getElementById("details").value;
    const nextButton = document.getElementById("tab2");

    if (category && subcategory && objective && details) {
        nextButton.classList.remove("hidden");
    } else {
        nextButton.classList.add("hidden");
    }
}

document.getElementById("category").addEventListener("change", updateSubcategory);
document.getElementById("subcategory").addEventListener("change", updateObjective);
document.getElementById("objective").addEventListener("change", updateDetails);

window.onload = () => {
    const subcategoryLabel = document.querySelector('label[for="subcategory"]');
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("tab2");
    subcategoryLabel.classList.add("hidden");
    objectiveLabel.classList.add("hidden");
    detailsLabel.classList.add("hidden");
    nextButton.classList.add("hidden");
};

