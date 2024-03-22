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

document.getElementById('district_form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Create FormData object for district_form
    const formDataDistrict = new FormData(this);

    // Get the buffer_form and append its data to formDataDistrict
    const bufferForm = document.getElementById('buffer_form');
    const formDataBuffer = new FormData(bufferForm);
    // formDataBuffer.forEach((value, key) => {
    //     formDataDistrict.append(key, value);
    // });
    for (const[key,value] of formDataBuffer.entries()){
        formDataDistrict.append(key,value);
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
        console.log(data);
        // Update the webpage based on the response
        // e.g., display a message, update a table, etc.
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
