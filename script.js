var timer;
var delay = 2000; // delay time in milliseconds

document.getElementById('phone').addEventListener('input', function(event) {
    clearTimeout(timer);
    timer = setTimeout(function() {
        // Check if the input is not empty before calling the function
        if (event.target.value.trim() !== '') {
            callYourFunction(event.target.value);
        }
    }, delay);
});

function callYourFunction(input) {
    // Get the elements
    const resultText = document.getElementById('result');
    const rawResultsList = document.getElementById('raw-results');

    // Set the text to "analyzing" while waiting for the API response
    resultText.textContent = "analyzing";

    // Create the request body
    var data = { text: input };

    // Create the request options
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Make the HTTP request
    fetch('https://predict-tf3ihxovta-uc.a.run.app', options)
        .then(response => response.json())
        .then(data => {
            // Log the response data
            console.log('Response data:', data);

            // Update the text of the resultText element with the Interpreted_Result
            resultText.textContent = data.Interpreted_Result;

            // Clear the rawResultsList
            rawResultsList.innerHTML = '';

            // Add each item in the Raw_Results to the rawResultsList
            for (let item in data.Raw_Results) {
                let listItem = document.createElement('li');
                listItem.textContent = item + ': ' + data.Raw_Results[item];
                rawResultsList.appendChild(listItem);
            }
        })
        .catch(error => {
            // Log any errors
            console.log('Error:', error);

            // Update the text of the resultText element to indicate an error
            resultText.textContent = "Error in analyzing text";
        });
}


