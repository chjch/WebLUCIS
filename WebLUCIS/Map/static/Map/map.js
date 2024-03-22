// mapboxgl.accessToken = 'pk.eyJ1IjoiY2hqY2giLCJhIjoiY2t0ZXA1aHYyMDBpczJvbXF0ODBoOHowdCJ9.vInEZlCBY3vMDQoiCjNNIw';
// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//     style: 'mapbox://styles/mapbox/streets-v12', // style URL
//     center: [-74.5, 40], // starting position [lng, lat]
//     zoom: 9 // starting zoom
// });
const {DeckGL, GeoJsonLayer} = deck;
const showMmdaBtn = document.getElementById("show-mmda-btn");
const showBuffer = document.getElementById("show-buffer-btn");

let deckgl = new DeckGL({
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

showMmdaBtn.addEventListener("click", () => {
    const selectDistrict = document.getElementById('id_district');
    const district_id = selectDistrict.options[selectDistrict.selectedIndex].value;
    let apiUrl = `/api/mmdas/${district_id}`;
    const geojsonLayer = new GeoJsonLayer({
        data: apiUrl,
        opacity: 0.5,
        stroked: false,
        filled: true,
        extruded: false,
        wireframe: true,
        fp64: true,
        getLineColor: f => [255, 255, 255],
        pickable: true
    });
    deckgl.setProps({ layers: [geojsonLayer] });
});

showBuffer.addEventListener("click", () => {
    let apiUrl = `/api/buffer/`;
    const geojsonLayer = new GeoJsonLayer({
        data: apiUrl,
        opacity: 0.5,
        stroked: false,
        filled: true,
        extruded: false,
        wireframe: true,
        fp64: true,
        getLineColor: f => [255, 255, 255],
        getFillColor: [0, 255, 0], // Set fill color to green
        pickable: true
    });
    deckgl.setProps({ layers: [geojsonLayer] });
});

// const COLOR_SCALE = [
//     // negative
//     [65, 182, 196],
//     [127, 205, 187],
//     [199, 233, 180],
//     [237, 248, 177],
//
//     // positive
//     [255, 255, 204],
//     [255, 237, 160],
//     [254, 217, 118],
//     [254, 178, 76],
//     [253, 141, 60],
//     [252, 78, 42],
//     [227, 26, 28],
//     [189, 0, 38],
//     [128, 0, 38]
// ];

// function colorScale(x) {
//     const i = Math.round(x * 7) + 4;
//     if (x < 0) {
//         return COLOR_SCALE[i] || COLOR_SCALE[0];
//     }
//     return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];
// }

// function getTooltip({object}) {
//     return object && `Average Property Value
// ${object.properties.valuePerSqm}
// Growth
// ${Math.round(object.properties.growth * 100)}`;
// }