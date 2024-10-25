let tabData = {};
var geojsonData;
var words;
var selectedcolors;
var selectedWord;

const formUrls = {
    'Road Accessibility': '/submit_road_form/',
    'Population Density': '/submit_popdensity_form/',
}

document.addEventListener('DOMContentLoaded', function () {
    const tabsContainer = document.getElementById('tabs');
    const tabsContentContainer = document.getElementById('popup-content');
    const addTabButton = document.getElementById('add-tab');

    let tabCounter = 0;
    let currentTabId = null;

    // Function to create the flowchart
    function createFlowchart(tabId) {
        return `
    <div class="d-flex justify-content-between mb-4 flowchart">
        <div class="step" data-step="1">
            <div class="circle">1</div>
            <div class="description">Select Region & District</div>
        </div>
        <div class="step" data-step="2">
            <div class="circle">2</div>
            <div class="description">Select Category</div>
        </div>
        <div class="step" data-step="3">
            <div class="circle-container">
                <div class="circle">3</div>
                <div class="spinner"></div>
            </div>
            <div class="description">Select Parameters</div>
        </div>
    </div>
    `;
    }

    // Function to create a new tab and corresponding content with steps and flowchart
    function createTab() {
        tabCounter++; // Increment tab counter for unique tab IDs
        const tabId = tabCounter;
        const tabName = `Tab ${tabId}`;

        // Create new tab button with an input for the tab name
        const newTab = document.createElement('button');
        newTab.classList.add('form-tab');
        newTab.setAttribute('data-tab', tabId);

        // Add an editable input field for the tab name
        newTab.innerHTML = `
        <span class="tab-text" data-tab-name-id="${tabId}">${tabName}</span>
        <input type="text" class="tab-name-input" style="display: none;" value="${tabName}" data-tab-name-id="${tabId}" />
        <button class="close-tab-btn" data-tab="${tabId}">&times;</button>
        `;
        tabsContainer.appendChild(newTab);

        //switch to region tab when new tab creates
        var regionButton = document.querySelector('button[data-tab="Region"]');
        regionButton.click();
        $(`.tablinks[data-tab="Region"]`).addClass('active');


        // Create corresponding tab content
        const newTabContent = document.createElement('div');
        newTabContent.classList.add('tab-content');
        newTabContent.id = `tab-${tabId}`;
        newTabContent.setAttribute('data-current-step', '1');
        newTabContent.setAttribute('data-tab-name', tabName);
        newTabContent.style.display = 'none';

        // Add flowchart and form steps
        newTabContent.innerHTML = `
        ${createFlowchart(tabId)}
        <div id="form-container">
            <div class="step-form step-1"></div>
            <div class="step-form step-2" style="display: none;"></div>
            <div class="step-form step-3" style="display: none;"></div>
        </div>
        `;

        tabsContentContainer.appendChild(newTabContent);

        // Set up the event listener for the new tab button
        newTab.addEventListener('click', function () {
            switchTab(tabId);
        });

        // Add event listener for changing the tab name input
        const tabNameSpan = newTab.querySelector('.tab-text');
        const tabNameInput = newTab.querySelector('.tab-name-input');

        tabNameSpan.addEventListener('dblclick', function () {
            tabNameSpan.style.display = 'none';  // Hide the span
            tabNameInput.style.display = 'block';  // Show the input
            tabNameInput.focus();  // Focus on the input for immediate editing
        });
        // When the input loses focus or when the Enter key is pressed, save the changes
        tabNameInput.addEventListener('blur', function () {
            updateTabName(tabId, tabNameInput.value);
            tabNameInput.style.display = 'none';  // Hide the input
            tabNameSpan.style.display = 'block';  // Show the span again
        });

        tabNameInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                updateTabName(tabId, tabNameInput.value);
                tabNameInput.style.display = 'none';  // Hide the input
                tabNameSpan.style.display = 'block';  // Show the span again
            }
        });

        const closeTabBtn = newTab.querySelector('.close-tab-btn');
        closeTabBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent tab switching on close button click
            closeTab(tabId);
        });

        // Automatically switch to the newly created tab
        switchTab(tabId);

        // Initialize flowchart for the current step
        updateFlowchart(newTabContent);
    }
    // Function to close a tab
    function closeTab(tabId) {
        // Check if there are more than one tab open
        const remainingTabs = document.querySelectorAll('.form-tab');
        if (remainingTabs.length <= 1) {
            alert("At least one tab must remain open."); // Notify user
            return; // Exit the function if there is only one tab
        }

        // Remove the tab button
        const tabButton = document.querySelector(`.form-tab[data-tab="${tabId}"]`);
        if (tabButton) {
            tabButton.remove();
        }

        // Remove the corresponding tab content
        const tabContent = document.getElementById(`tab-${tabId}`);
        if (tabContent) {
            tabContent.remove();
        }

        // Remove the stored data for this tab
        if (tabData[tabId]) {
            delete tabData[tabId];
        }

        // Switch to another tab if available, or display a message
        if (remainingTabs.length > 1) {
            // Switch to the first remaining tab
            const firstTabId = remainingTabs[0].getAttribute('data-tab');
            switchTab(parseInt(firstTabId));
        } else {
            tabsContentContainer.innerHTML = '<p>No tabs available. Add a new tab.</p>';
        }
    }


    // Function to switch between tabs
    function switchTab(tabId) {

        if (currentTabId === tabId) {
            // Hide the tab content and reset the current tab ID
            const tabContent = document.getElementById(`tab-${tabId}`);
            if (tabContent) {
                tabContent.style.display = 'none'; // Hide the current tab content
            }
            currentTabId = null; // Reset the current tab ID
            return; // Exit the function
        }
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.form-tab');

        tabContents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.style.display = 'block'; // Show selected tab content
            } else {
                content.style.display = 'none'; // Hide other tab contents
            }
        });
        tabButtons.forEach(button => {
            if (parseInt(button.getAttribute('data-tab')) === tabId) {
                button.classList.add('active'); // Add 'active' to the current tab
            } else {
                button.classList.remove('active'); // Remove 'active' from other tabs
            }
        });

        currentTabId = tabId;
        loadTabData(currentTabId);
        const storedData = sessionStorage.getItem(currentTabId);

        if (storedData) {
            const decompressedData = JSON.parse(LZString.decompress(storedData));
            updatemap(decompressedData);
        }
        else {
            $('#legend').css('display', 'none');
            clearMap();
        }
    }
    function clearMap() {
        deckgl.setProps({ layers: [] });
    }

    function loadTabData(tabId) {
        const formData = tabData[tabId];

        if (formData) {
            var basemapButton = document.querySelector('button[data-tab="Basemap"]');
            basemapButton.click();
            $(`.tablinks[data-tab="Basemap"]`).addClass('active');

            //Form Data
            const currentTabContent = document.getElementById(`tab-${currentTabId}`);
            const form = $(currentTabContent).find('form');
            const defaultValues = {
                "road_class": "primary",
                "cell_size": "30",
                "method": "euclidean",
                "rescale_min": "1",
                "rescale_max": "9"
            };
            form.find('input, select, textarea').each(function () {
                const name = $(this).attr('name'); // Get the name attribute of the field
                const value = tabData[currentTabId] && tabData[currentTabId][name]
                    ? tabData[currentTabId][name]
                    : defaultValues[name] || '';
                $(this).val(value);
            });

            //District form
            const districtForm = document.getElementById('district_form');
            if (districtForm) {
                //const formDataDistrict = new FormData(districtForm);

                // Get the region and district values only once outside the loop
                let regionValue = formData['region'];
                let districtValue = formData['district'];
                zoomToRegion(formData['district_name']);

                // Set the region value
                if (regionValue) {
                    $(`#district_form [name="region"]`).val(regionValue);

                    // Trigger the district load for the restored region
                    $.ajax({
                        url: '/load_districts/',
                        data: { region: regionValue },
                        success: function (response) {
                            const districtSelect = $(`#district_form [name="district"]`);

                            // Populate the district dropdown with the response (assuming it's HTML <option> elements)
                            districtSelect.html(response);

                            // After populating, set the district value if available
                            if (districtValue) {
                                districtSelect.val(districtValue);
                            }
                        },
                        error: function () {
                            console.error('Failed to load districts.');
                        }
                    });
                }
            }

            // BaseMap
            if (formData.category) {
                document.getElementById("category").value = formData.category;
                updateSubcategory();  // To update subcategory dropdown
            }
            if (formData.subcategory) {
                document.getElementById("subcategory").value = formData.subcategory;
                updateObjective();  // To update objective dropdown
            }

            if (formData.objective) {
                document.getElementById("objective").value = formData.objective;
                updateDetails();  // To update details dropdown
            }

            if (formData.details) {
                document.getElementById("details").value = formData.details;
            }

            checkNextButton();
        }
        else {
            $('#Basemap').find('input, select, textarea').each(function () {
                $(this).val('');
            });
            $('#subcategory').addClass('hidden');
            $('label[for="subcategory"]').addClass('hidden');

            $('#objective').addClass('hidden');
            $('label[for="objective"]').addClass('hidden');

            $('#details').addClass('hidden');
            $('label[for="details"]').addClass('hidden');
            $('#category-next-btn').addClass('hidden');

            var regionButton = document.querySelector('button[data-tab="Region"]');
            regionButton.click();
            $(`.tablinks[data-tab="Region"]`).addClass('active');
        }
    }

    // Function to update step and run the corresponding function
    function updateStep(tabContent) {
        let currentStep = parseInt(tabContent.getAttribute('data-current-step'));
        const steps = tabContent.querySelectorAll('.step-form');

        if (currentStep < steps.length) {
            steps[currentStep - 1].style.display = 'none'; // Hide the current step
            steps[currentStep].style.display = 'block';    // Show the next step
            tabContent.setAttribute('data-current-step', currentStep + 1);

            // Call the corresponding function for the current step
            runFunctionForStep(currentStep + 1);

            // Update flowchart for the new step
            updateFlowchart(tabContent);
        }
    }

    // Function to update the flowchart's active and done steps
    function updateFlowchart(tabContent) {
        const currentStep = parseInt(tabContent.getAttribute('data-current-step'));
        const flowchartSteps = tabContent.querySelectorAll('.flowchart .step');

        flowchartSteps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            if (stepNumber < currentStep) {
                step.classList.add('done');  // Mark previous steps as done
                step.classList.remove('active');
            } else if (stepNumber === currentStep) {
                step.classList.add('active'); // Mark the current step as active
                step.classList.remove('done');
            } else {
                step.classList.remove('active', 'done'); // Reset future steps
            }
        });
    }

    // Function to update the tab name everywhere when it is changed
    function updateTabName(tabId, newName) {
        // Update the tab button
        const tabButton = document.querySelector(`[data-tab-name-id="${tabId}"]`);
        tabButton.value = newName;
        const tabNameSpan = document.querySelector(`.tab-text[data-tab-name-id="${tabId}"]`);
        tabNameSpan.textContent = newName;  // Update the span text with the new name

        // Update the tab content name (in forms or anywhere else)
        const tabContent = document.getElementById(`tab-${tabId}`);
        tabContent.setAttribute('data-tab-name', newName);
        const tabNameSpans = tabContent.querySelectorAll('.tab-name-span');
        tabNameSpans.forEach(span => {
            span.textContent = newName;
        });
    }

    // Function for specific steps
    function runFunctionForStep(step) {
        const currentTabContent = document.getElementById(`tab-${currentTabId}`);
        if (step === 1) {


        } else if (step === 2) {

            const formData = {};

            const formDataDistrict = new FormData(document.getElementById('district_form'));
            for (let [key, value] of formDataDistrict.entries()) {
                formData[key] = value;
            }
            const districtSelect = $("#district_form [name='district'] option:selected").text();

            // Add the district name to formData
            formData['district_name'] = districtSelect;
            tabData[currentTabId] = formData;

            var basemapButton = document.querySelector('button[data-tab="Basemap"]');
            basemapButton.click();
            $(`.tablinks[data-tab="Basemap"]`).addClass('active');
        } else if (step === 3) {
            // Step 3: Load form content via AJAX
            const category = document.getElementById("category").value;
            const subcategory = document.getElementById("subcategory").value;
            const objective = document.getElementById("objective").value;
            const details = document.getElementById("details").value;

            tabData[currentTabId] = { ...tabData[currentTabId], category, subcategory, objective, details };

            formname = $("#details").val(); // Assuming formname is fetched from an input field
            const uniqueTabName = generateUniqueTabName(formname);
            const tabButton = document.querySelector(`.form-tab.active .tab-text[data-tab-name-id="${currentTabId}"]`).parentElement;

            // Update the content of the <span> to the unique tab name
            const tabTextSpan = tabButton.querySelector('.tab-text');
            if (tabTextSpan) {
                tabTextSpan.textContent = uniqueTabName; // Update displayed tab name
            }

            // If you also want to update the hidden input value, do this:
            const tabNameInput = tabButton.querySelector('.tab-name-input');
            if (tabNameInput) {
                tabNameInput.value = uniqueTabName; // Update input value
            }

            loadFormContent(formname, function (response) {
                const step3Container = currentTabContent.querySelector('.step-form.step-3');
                step3Container.innerHTML = response; // Load form content into step 3

                const runButton = step3Container.querySelector('.next-btn');
                if (runButton) {
                    runButton.addEventListener('click', function () {
                        handleRunButtonClick();
                    });
                }
            });
        }
    }

    function handleRunButtonClick() {
        const currentTabContent = document.getElementById(`tab-${currentTabId}`);

        // Step 3: Show loading animation on circle 3
        const step3 = currentTabContent.querySelector('.flowchart .step[data-step="3"]');
        const spinner = step3.querySelector('.spinner');
        const form = currentTabContent.querySelector('form');
        const formData = new FormData(form); // Collect all form data

        // Convert form data to a JavaScript object
        const formValues = {};
        formData.forEach((value, key) => {
            formValues[key] = value;
        });
        tabData[currentTabId] = { ...tabData[currentTabId], ...formValues };

        spinner.classList.add('loading'); // Add loading animation
        const url = formUrls[tabData[currentTabId].details];
        if (url) {

            $.ajax({
                url: url,
                type: 'POST',
                data: tabData[currentTabId],
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function (response) {
                    geojsonData = JSON.parse(response.result);
                    const compressedData = LZString.compress(JSON.stringify(geojsonData));
                    sessionStorage.setItem(currentTabId, compressedData);

                    // Hide the current tab's popup content
                    $('.popup-content.active').toggle();

                    // Update map with geojson data
                    updatemap(geojsonData);
                    currentTabContent.style.display = 'none'

                    // Remove loading animation from circle 3
                    step3.classList.add('done');
                    step3.classList.remove('active');
                    spinner.classList.remove('loading');

                    //circle3.classList.add('done'); // Mark circle 3 as done
                },
                error: function (xhr, status, error) {
                    console.log(error);
                    alert('Form submission failed: ' + error);

                    // Remove loading animation from circle 3
                    step3.classList.add('error');
                    step3.classList.remove('active');
                    spinner.classList.remove('loading');
                }
            });
        }
        else {
            alert("URL not found");
        }
    }


    addTabButton.addEventListener('click', function () {
        createTab();
    });

    // Event listener for all next buttons (global listener for dynamically created buttons)
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('next-btn')) {
            // Handle the click event on dynamically created buttons
            if (currentTabId !== null) {
                const currentTabContent = document.getElementById(`tab-${currentTabId}`);
                updateStep(currentTabContent); // Update the current tab's steps
            }
        }
    });

    function loadFormContent(formname, callback) {
        $.ajax({
            url: `/get-form-content/${formname}`,
            type: 'GET',
            success: function (response) {
                callback(response);
            },
            error: function (xhr, status, error) {
                console.error('Failed to load form content:', error);
            }
        });
    }
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


    // Initially create the first tab
    createTab();
});
