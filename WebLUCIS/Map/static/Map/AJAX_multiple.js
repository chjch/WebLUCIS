export const { DeckGL, GeoJsonLayer } = deck;
const PolygonLayer = deck.PolygonLayer;

var suitabilityvalue = "";

const regionCoordinates = {
    'AHAFO': { 'latitude': 6.915957658319314, 'longitude': -2.450272051613865, 'zoom': 9.031455388 },
    'ASHANTI': { 'latitude': 6.799497046051897, 'longitude': -1.456951444353649, 'zoom': 7.935337555 },
    'BONO': { 'latitude': 7.692998692435765, 'longitude': -2.503231223941782, 'zoom': 7.935337555 },
    'BONO EAST': { 'latitude': 7.885390456304549, 'longitude': -1.0777241638390365, 'zoom': 7.935337555 },
    'CENTRAL': { 'latitude': 5.567658785324738, 'longitude': -1.2153729285178088, 'zoom': 8.483396472 },
    'EASTERN': { 'latitude': 6.417685384672836, 'longitude': -0.44846162590329186, 'zoom': 8.483396472 },
    'GREATER ACCRA': { 'latitude': 5.8056478802455445, 'longitude': 0.048425229540782766, 'zoom': 9.031455388 },
    'NORTHERN': { 'latitude': 9.462843309970822, 'longitude': -0.2858374640276793, 'zoom': 7.935337555 },
    'OTI': { 'latitude': 7.968968838241324, 'longitude': 0.27306905529269443, 'zoom': 7.935337555 },
    'SAVANNAH': { 'latitude': 9.035347007758276, 'longitude': -1.5324638644157744, 'zoom': 7.935337555 },
    'UPPER EAST': { 'latitude': 10.780661290885917, 'longitude': -0.8032251668079766, 'zoom': 9.031455388 },
    'UPPER WEST': { 'latitude': 10.425770760312389, 'longitude': -2.2120966783190283, 'zoom': 8.483396472 },
    'VOLTA': { 'latitude': 6.423677616029181, 'longitude': 0.5478463619201079, 'zoom': 8.483396472 },
    'WESTERN': { 'latitude': 5.400015967562922, 'longitude': -2.1489985015795128, 'zoom': 8.483396472 },
    'WESTERN NORTH': { 'latitude': 6.2246562155119705, 'longitude': -2.788317647141639, 'zoom': 8.483396472 }
};
export const heirarchydata = {
    "Urban": {
        "General": {
            "Physical": [
                "Existing Land Use",
                "Development Constraints",
                "Population Density"
            ],
            "Proximity": [
                "Road Accessibility",
                "Distance to City or Settlement"
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
function generateUniqueIds(data, parentId = 'a0') {
    let ids = {};

    // Iterate over the data
    Object.entries(data).forEach(([key, value], index) => {
        const currentId = parentId ? `${parentId}-${index}` : `${index}`;
        ids[currentId] = key; // Store the key with the generated ID

        // If the value is an object or array, recurse deeper
        if (typeof value === 'object' && !Array.isArray(value)) {
            const nestedIds = generateUniqueIds(value, currentId);
            ids = { ...ids, ...nestedIds }; // Merge the nested IDs
        } else if (Array.isArray(value)) {
            value.forEach((subItem, subIndex) => {
                const itemId = `${currentId}-${subIndex}`;
                ids[itemId] = subItem; // Store array elements with unique IDs
            });
        }
    });

    return ids;
}

// Example usage with your data:
const uniqueIds = generateUniqueIds(heirarchydata);

function getIdFromUniqueIds(...keys) {
    let id = '';
    keys.forEach(key => {
        const keyId = Object.keys(uniqueIds).find(id => uniqueIds[id] === key);
        if (keyId) {
            id = id ? `${id}-${keyId.split('-').pop()}` : keyId;
        }
    });
    return id;
}

export var deckgl = new DeckGL({
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
// Function to update the layers based on the selected region
function updateLayers(region) {
    const layers = [];

    // Add a polygon layer for the selected region
    if (region) {
        const coords = regionCoordinates[region];
        const borderColor = [0, 0, 0]; // Dark border color
        const fillColor = [255, 255, 255, 0]; // Transparent fill color

        // dummy coordinates as of now we need to chnage this with actual coordinates
        const polygonCoordinates = getPolygonCoordinates(region);

        layers.push(new PolygonLayer({
            id: 'border-layer',
            data: [{ polygon: polygonCoordinates }],
            getPolygon: d => d.polygon,
            getFillColor: fillColor,
            getLineColor: borderColor,
            getLineWidth: 2, // Set the border width
            lineWidthMinPixels: 2,
            pickable: true,
            stroked: true, // Enable border stroke
            filled: true, // Fill the polygon
        }));
    }

    // Update deckgl with the new layers
    deckgl.setProps({ layers });
}
function getPolygonCoordinates(region) {

    return [
        [
            ////according to the selected region
        ]
    ];
}

export function getCookie(name) {
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

export async function zoomToRegion(region) {
    let coords = regionCoordinates[region];
    if (coords == undefined) {
        try {
            const res = await fetch('/static/Map/districtCoordinates.json');
            const districtCoordinates = await res.json();
            coords = districtCoordinates[region];
        }
        catch (error) {
            console.log("Error fetching district coordinates:", error);
            return;
        }

        // coords = districtCoordinates[region];
    }
    if (coords) {
        deckgl.setProps({
            initialViewState: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                zoom: coords.zoom,
                transitionDuration: 500 // Smooth transition
            }
        });
        updateLayers(region);
    }
}
window.zoomToRegion = zoomToRegion;
export function transformToGeoJSON(data) {
    return data.map((item, index) => ({
        id: index.toString(),
        type: "Feature",
        properties: {
            [selectedWord.toLowerCase()]: item[selectedWord.toLowerCase()]
        },
        geometry: JSON.parse(item.geomm)
    }));
}




export function updateSubcategory() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory");
    const objective = document.getElementById("objective");
    const details = document.getElementById("details");
    const subcategoryLabel = document.querySelector('label[for="subcategory"]');
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("category-next-btn");

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

        const subcategories = Object.keys(heirarchydata[category]);
        subcategories.forEach(subcat => {
            const subcatId = getIdFromUniqueIds(category, subcat);
            subcategory.innerHTML += `<option value="${subcat}" data-id="${subcatId}">${subcat}</option>`;
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

export function updateObjective() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective");
    const details = document.getElementById("details");
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("category-next-btn");

    objective.innerHTML = '<option value="">Select...</option>';
    details.innerHTML = '<option value="">Select...</option>';

    if (category && subcategory) {
        objectiveLabel.classList.remove("hidden");
        objective.classList.remove("hidden");
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
        nextButton.classList.add("hidden");

        const objData = heirarchydata[category][subcategory];
        if (Array.isArray(objData)) {
            objData.forEach((obj, index) => {
                const objId = getIdFromUniqueIds(category, subcategory, obj);
                objective.innerHTML += `<option value="${obj}" data-id="${objId}">${obj}</option>`;
            });
        } else if (typeof objData === 'object') {
            const objectives = Object.keys(objData);
            objectives.forEach((obj, index) => {
                const objId = getIdFromUniqueIds(category, subcategory, obj);
                objective.innerHTML += `<option value="${obj}" data-id="${objId}">${obj}</option>`;
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

export   function updateDetails() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective").value;
    const details = document.getElementById("details");
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("category-next-btn");

    details.innerHTML = '<option value="">Select...</option>';

    if (category && subcategory && objective) {
        const objData = heirarchydata[category][subcategory][objective];
        if (objData !== undefined) {
            if (objData.length !== 0) {
                detailsLabel.classList.remove("hidden");
                details.classList.remove("hidden");

                if (Array.isArray(objData)) {
                    objData.forEach((detail, index) => {
                        const detailId = getIdFromUniqueIds(category, subcategory, objective, detail);
                        details.innerHTML += `<option value="${detail}" data-id="${detailId}">${detail}</option>`;
                    });
                } else if (typeof objData === 'object') {
                    const nestedDetails = Object.keys(objData);
                    nestedDetails.forEach((detail, index) => {
                        const detailId = getIdFromUniqueIds(category, subcategory, objective, detail);
                        details.innerHTML += `<option value="${detail}" data-id="${detailId}">${detail}</option>`;
                    });
                    nextButton.classList.add("hidden");
                } else {
                    detailsLabel.classList.add("hidden");
                    details.classList.add("hidden");
                }
            } else {
                detailsLabel.classList.add("hidden");
                details.classList.add("hidden");
                nextButton.classList.remove("hidden");
            }
        } else {
            detailsLabel.classList.add("hidden");
            details.classList.add("hidden");
            nextButton.classList.remove("hidden");
        }
    } else {
        detailsLabel.classList.add("hidden");
        details.classList.add("hidden");
    }
}
export function checkNextButton() {
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const objective = document.getElementById("objective").value;
    const details = document.getElementById("details").value;
    const nextButton = document.getElementById("category-next-btn");

    if (category && subcategory && objective && details) {
        nextButton.classList.remove("hidden");
    } else {
        nextButton.classList.add("hidden");
    }
}
window.checkNextButton = checkNextButton;

document.getElementById("category").addEventListener("change", updateSubcategory);
document.getElementById("subcategory").addEventListener("change", updateObjective);
document.getElementById("objective").addEventListener("change", updateDetails);

window.onload = () => {
    const subcategoryLabel = document.querySelector('label[for="subcategory"]');
    const objectiveLabel = document.querySelector('label[for="objective"]');
    const detailsLabel = document.querySelector('label[for="details"]');
    const nextButton = document.getElementById("category-next-btn");
    subcategoryLabel.classList.add("hidden");
    objectiveLabel.classList.add("hidden");
    detailsLabel.classList.add("hidden");
    nextButton.classList.add("hidden");
};

