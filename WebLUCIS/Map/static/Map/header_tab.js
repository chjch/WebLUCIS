
let activeTab = null;
let tabData = {};
let tabState = {};

$(".progress-container").css('display', 'none');


$(document).ready(function () {
    // Initial tab setup with one tab "Tab1"
    createTab('Tab1');

    $('.add-tab-btn').on('click', function (e) {
        const newTabName = `Tab${$('.form-tab').length + 1}`; // Generate new tab name
        clickHandle(e, 'Region');
        $(`.tablinks[data-tab="Region"]`).addClass('active');
        createTab(newTabName);
    });

    function createFlowchartComponent() {
        // Create the flowchart HTML structure
        const $flowchart = $(`
            <div class="container mt-5">
                <div class="d-flex justify-content-between mb-4 flowchart">
    
                    <div class="mermaid">
                    graph LR
                        A([<div class="stepA" style="color: red;"> Regions</div>]) --> C{{<div class="stepC" style="color: red;">Params</div>}}
                        B(<div class="stepB" style="color: red;">Category</div>) --> C
                    </div>
    
                    <div class="step" data-step="1">
                        <div class="circle">1</div>
                        <div class="description">Select Region & District</div>
                    </div>
                    <div class="step" data-step="2">
                        <div class="circle">2</div>
                        <div class="description">Select Category</div>
                    </div>
                    <div class="step" data-step="3">
                        <div class="circle">3</div>
                        <div class="description">Select Parameters</div>
                    </div>
                </div>
            
                
                <div id="form-container"></div>
                
            </div>
            
        `);

        // Initialize the flowchart functionality for this instance
        initializeFlowchart($flowchart);
        mermaid.init(undefined, $flowchart.find('.mermaid'));

        return $flowchart;
    }



    function createTab(tabName) {
        // alert($('.form-tab').length);
        // Create a new tab
        const $tabContainer = $('#form-tab-container');
        const $newTab = $('<div>', {
            'class': 'form-tab',
            'name': tabName,
            'html': `
            <span class="tab-text">${tabName}</span>
            <input type="text" class="edit-tab-name" style="width:100px;background-color:#d3d3d3;display:none;" value="${tabName}">
            <button class="close-btn" onclick="closeTab(event, '${tabName}')">&times;</button>
        `,
            'click': function () { activateTab($(this)); }
        });

        // Insert the tab
        $tabContainer.append($newTab);
        const $flowchartComponent = createFlowchartComponent();

        // Create corresponding empty content for the new tab
        const $popupContent = $('<div>', {
            'class': 'popup-content',
            'id': `form-tab-content-${tabName}`,
            'html': $flowchartComponent
        });

        $('body').append($popupContent);

        // Automatically activate the new tab
        activateTab($newTab);
        $newTab.find('.tab-text').on('dblclick', function () {
            const $span = $(this);
            const $input = $span.siblings('.edit-tab-name');
            $span.hide();
            $input.show().focus();
        });

        // Handle renaming on Enter key or blur event
        $newTab.find('.edit-tab-name').on('keypress blur', function (e) {
            if (e.type === 'keypress' && e.which !== 13) return; // Only proceed on Enter key
            const $input = $(this);
            const newTabName = $input.val().trim();

            if (newTabName) {
                $input.siblings('.tab-text').text(newTabName).show();
                $input.hide();
                $newTab.attr('name', newTabName);
                $popupContent.attr('id', `form-tab-content-${newTabName}`);
            } else {
                $input.siblings('.tab-text').show();
                $input.hide();
            }
        });
    }

    function activateTab($tab) {
        if (activeTab && activeTab[0] === $tab[0]) {

            $('.popup-content.active').toggle();

        } else {
            if (activeTab) {
                // Save current tab data
                saveTabData(activeTab.attr('name'));
            }
            // Deactivate all tabs and popups
            $('.form-tab').removeClass('active');
            $('.popup-content').removeClass('active').hide();

            // Activate the clicked tab
            $tab.addClass('active');

            // Show and activate the corresponding content
            const tabName = $tab.attr('name');
            const $tabContent = $(`#form-tab-content-${tabName}`);
            $tabContent.addClass('active').show();
            if (tabData[tabName]) {
                restoreTabData(tabName);
            } else {
                clearFormData($tabContent);
            }

            const storedData = localStorage.getItem(tabName);


            if (storedData) {
                const decompressedData = JSON.parse(LZString.decompress(storedData));
                updateMap(decompressedData);
            } else {
                // clear the map if there's no data
                clearMap();
            }

            activeTab = $tab;
        }
    }

    function saveTabData(tabName) {
        const $tabContent = $(`#form-tab-content-${tabName}`);
        const formData = {};

        // Assuming all input elements are within this tab's content
        $tabContent.find('input, select, textarea').each(function () {
            formData[$(this).attr('name')] = $(this).val();
        });

        const formDataDistrict = new FormData(document.getElementById('district_form'));
        for (let [key, value] of formDataDistrict.entries()) {
            formData[key] = value;
        }

        // Collect input elements data within the Basemap tab
        $('#Basemap').find('input, select, textarea').each(function () {
            formData[$(this).attr('id')] = $(this).val();
        });
        const category = document.getElementById("category").value;
        const subcategory = document.getElementById("subcategory").value;
        const objective = document.getElementById("objective").value;
        const details = document.getElementById("details").value;

        tabState[tabName] = { category, subcategory, objective, details };

        tabData[tabName] = formData;
    }

    function restoreTabData(tabName) {
        const $tabContent = $(`#form-tab-content-${tabName}`);
        const formData = tabData[tabName];

        // Restore form data
        $tabContent.find('input, select, textarea').each(function () {
            const name = $(this).attr('name');
            $(this).val(formData[name] || '');
        });
        // Restore the district form data
        const districtForm = document.getElementById('district_form');
        if (districtForm) {
            const formDataDistrict = new FormData(districtForm);
            for (let [key, value] of formDataDistrict.entries()) {
                $(`#district_form [name="${key}"]`).val(formData[key] || '');
            }
        }
        const state = tabState[tabName];

        if (state) {
            document.getElementById("category").value = state.category;
            updateSubcategory();  // To update subcategory dropdown

            if (state.subcategory) {
                document.getElementById("subcategory").value = state.subcategory;
                updateObjective();  // To update objective dropdown
            }

            if (state.objective) {
                document.getElementById("objective").value = state.objective;
                updateDetails();  // To update details dropdown
            }

            if (state.details) {
                document.getElementById("details").value = state.details;
            }

            checkNextButton();  // To handle visibility of the next button
        }


        // Restore input elements within the Basemap tab
        $('#Basemap').find('input, select, textarea').each(function () {
            const id = $(this).attr('id');
            $(this).val(formData[id] || '');
        });
    }

    function clearFormData($tabContent) {
        // Clear all input fields within the tab content
        $tabContent.find('input, select, textarea').each(function () {
            $(this).val('');
        });
        $('#Basemap').find('input, select, textarea').each(function () {
            $(this).val('');
        });
        $('#subcategory').addClass('hidden');
        $('label[for="subcategory"]').addClass('hidden');

        $('#objective').addClass('hidden');
        $('label[for="objective"]').addClass('hidden');

        $('#details').addClass('hidden');
        $('label[for="details"]').addClass('hidden');

        // Optionally, reset the Next button visibility if needed
        $('#tab2').addClass('hidden');
    }

    function closeTab(event, tabName) {
        if (event) event.stopPropagation(); // Prevent the click event from bubbling up to the tab
        if (activeTab.length == 1) {
            alert();
        }
        else {

            // Hide the tab and its associated popup
            const $tabToHide = $(`.form-tab[name="${tabName}"]`);
            const $popupToHide = $(`#form-tab-content-${tabName}`);

            $tabToHide.remove();
            $popupToHide.remove();

            // Clear the active tab if it was closed
            if (activeTab && activeTab.attr('name') === tabName) {
                activeTab = null;
            }

            // Optionally, activate the first remaining visible tab if any
            const $firstVisibleTab = $('.form-tab:visible').first();

            if ($firstVisibleTab.length) {
                activateTab($firstVisibleTab);
            }
        }
    }


    function initializeFlowchart($container) {
        let currentStep = 1;
        const totalSteps = 4;

        updateFlowchart();
        $('#tab1').on('click', function (e) {
            if (currentStep === 1) {
                proceedToNextStep();
                clickHandle(e, 'Basemap');
                $(`.tablinks[data-tab="Basemap"]`).addClass('active');
                $(".stepA").css("color", "green");
            }
        });
        $('#tab2').on('click', function (e) {
            console.log(activeTab);
            if (currentStep === 2) {
                proceedToNextStep();
                formname = $("#details").val();
                const uniqueTabName = generateUniqueTabName(formname);

                activeTab.find('.tab-text').text(uniqueTabName);

                loadFormContent(formname); // Load and display the form
                $(".stepB").css("color", "green");

            }
        });
        $(document).on('click', ".paramssubmit", function (e) {
            if (currentStep === 3) {
                e.preventDefault(); // Prevent default form submission for now
                proceedToNextStep();
                showCompletion();
                $(".stepC").css("color", "green");



                const currentTabName = activeTab.attr('name');
                saveTabData(currentTabName);

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
                }, 500);

                // Perform AJAX request
                $.ajax({
                    url: '/submit_road_form/',
                    type: 'POST',
                    data: tabData[currentTabName],
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: function (response) {
                        // Handle the response here
                        console.log(response);
                        geojsonData = JSON.parse(response.result);
                        const compressedData = LZString.compress(JSON.stringify(geojsonData));
                        localStorage.setItem(currentTabName, compressedData);
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

                        updateMap(geojsonData);
                        // const uniqueLayerId = `geojson-layer-${Date.now()}`;
                        // const geojsonLayer = new GeoJsonLayer({
                        //     id: uniqueLayerId, // Unique identifier for the layer
                        //     data: geojsonData, // Use `data.result` if it contains the GeoJSON data
                        //     opacity: 0.8,
                        //     stroked: true,
                        //     filled: true,
                        //     extruded: false,
                        //     wireframe: false,
                        //     lineWidthMinPixels: 1, // Minimum width of stroke lines
                        //     getFillColor: [0, 255, 0], // Set fill color to green
                        //     getLineWidth: 1, // Set stroke width
                        //     pickable: true
                        // });

                        // // Set the new layer to the deck.gl instance
                        // deckgl.setProps({ layers: [geojsonLayer] });
                    },
                    error: function (xhr, status, error) {
                        // Handle errors
                        console.log(error);
                        alert('Form submission failed: ' + error);
                    }
                });
            }
        });


        // if (currentStep < totalSteps) {
        //     currentStep++;
        //     updateFlowchart();
        //     if (currentStep === totalSteps - 1) {
        //         formname = $("#details").val();
        //         loadFormContent(formname); // Load and display form
        //     }
        // } else if (currentStep === totalSteps) {
        //     currentStep++;
        //     showCompletion();
        // }
        // })

        $container.find('#prevBtn').on('click', function () {
            if (currentStep > 1) {
                currentStep--;
                updateFlowchart();
            }
        });
        function proceedToNextStep() {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFlowchart();
            }
        }

        function updateFlowchart() {
            $container.find('.circle').removeClass('active current').each(function () {
                const stepNumber = $(this).closest('.step').data('step');
                $(this).text(stepNumber);
            });

            $container.find('.step').each(function () {
                const stepNumber = $(this).data('step');
                const $circle = $(this).find('.circle');

                if (stepNumber < currentStep) {
                    $circle.addClass('active').text('✔');
                } else if (stepNumber === currentStep) {
                    $circle.addClass('current');
                }
            });

            // $container.find('.content-step').removeClass('active');
            // $container.find(`.content-step[data-content="${currentStep}"]`).addClass('active');
        }

        function showCompletion() {
            $container.find('.circle').removeClass('active current');
            // $container.find('.content-step').removeClass('active');
            // $container.find('.content-step[data-content="4"]').addClass('active');
        }
        function loadFormContent(formname) {
            $.ajax({
                url: `/get-form-content/${formname}`,
                type: 'GET',
                success: function (response) {
                    $('.popup-content.active').find('#form-container').append(response);
                },
                error: function (xhr, status, error) {
                    console.error('Failed to load form content:', error);
                }
            });
        }
    }

    function updateMap(data) {
        // Assuming `data` contains the required GeoJSON data
        const uniqueLayerId = `geojson-layer-${Date.now()}`;
        const geojsonLayer = new GeoJsonLayer({
            id: uniqueLayerId, // Unique identifier for the layer
            data: data,
            opacity: 0.8,
            stroked: true,
            filled: true,
            extruded: false,
            wireframe: false,
            lineWidthMinPixels: 1, // Minimum width of stroke lines
            getFillColor: [0, 255, 0], // Set fill color to green
            getLineWidth: 1, // Set stroke width
            pickable: true
        });

        // Set the new layer to the deck.gl instance
        deckgl.setProps({ layers: [geojsonLayer] });

        //const geojsonData = {};  // Load your geojson data
        // const deckglInstance = new DeckGL({
        //     mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        //     initialViewState: {
        //         latitude: 8.020501,
        //         longitude: -2.206687,
        //         zoom: 5.85,
        //         maxZoom: 16,
        //         pitch: 0
        //     },
        //     controller: true,
        //     layers: []
        // });

        // const colorPalette = new ColorPaletteModule(data, deckglInstance);
        // colorPalette.init();
    }

    // Optional function to clear the map if needed
    function clearMap() {
        deckgl.setProps({ layers: [] });
    }

    // function paramssubmit() {
    //     console.log(tabData);
    // }

    // $(document).on('click', ".paramssubmit", function (e) {
    //     e.preventDefault();

    // });
});

function generateUniqueTabName(formname) {
    let baseName = formname;
    let highestNumber = 0;

    // Regular expression to match tabs with the same base name followed by a number
    const regex = new RegExp(`^${baseName}(\\d*)$`);

    // Loop through all existing tabs
    $('.tab-text').each(function () {
        const existingTabName = $(this).text().trim();

        // Check if the tab name matches the base name (with or without a number)
        const match = existingTabName.match(regex);

        if (match) {
            // If there's a number, parse it and track the highest number found
            const numberPart = match[1];
            const number = numberPart ? parseInt(numberPart, 10) : 0;

            if (number >= highestNumber) {
                highestNumber = number + 1;
            }
        }
    });

    // Return the base name with the next available number (or no number if it's the first)
    return highestNumber === 0 ? baseName : baseName + highestNumber;
}