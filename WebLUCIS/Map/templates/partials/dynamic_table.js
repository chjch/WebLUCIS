{% comment %} document.addEventListener("DOMContentLoaded", function () {
    function addRow() {
        const table = document.getElementById("dataTable");
        const lastRow = table.rows[table.rows.length - 1];
        const inputs = lastRow.getElementsByTagName("input");

        let isFilled = true;
        for (let input of inputs) {
            if (input.value.trim() === "") {
                isFilled = false;
                break;
            }
        }

        if (isFilled) {
            let newRow = table.insertRow(-1);
            for (let i = 0; i < inputs.length; i++) {
                let cell = newRow.insertCell(i);
                let input = document.createElement("input");
                input.type = "text";
                input.name = inputs[i].name;
                input.className = "form-control";
                input.addEventListener("input", addRow);
                cell.appendChild(input);
            }
        }
    }

    // Attach event listener to all existing input fields
    document.querySelectorAll("#dataTable input").forEach(input => {
        input.addEventListener("input", addRow);
    });
}); {% endcomment %}

function addRow() {
    // Your function implementation
    console.log("addRow function called");
}