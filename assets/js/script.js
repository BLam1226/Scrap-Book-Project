// Initialize the Google Maps API
function initMap() {
}

// Function to handle form submission
function handleFormSubmission(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the destination input value
    const destinationInput = document.getElementById('destination');
    const destination = destinationInput.value;

    // Get the departure date input value
    const departureDateInput = document.getElementById('departure-date');
    const departureDate = departureDateInput.value;

    // Get the return date input value
    // const returnDateInput = document.getElementById('return-date');
    // const returnDate = returnDateInput.value;

    // Get the current location using the Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Call a function to process the location data
                processLocationData(currentLocation, destination, departureDate);
            },
            function (error) {
                console.error('Error getting current location:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Function to process location data
function processLocationData(currentLocation, destination, departureDate) {
    // Use the Google Geocoding API to get the destination location data
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                const destinationLocation = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };

                // Store the data in session storage
                localStorage.setItem('currentLocation', JSON.stringify(currentLocation));
                localStorage.setItem('destination', destination);
                localStorage.setItem('departureDate', departureDate);
                localStorage.setItem('destinationLocation', JSON.stringify(destinationLocation));

                // Display the result on the page
                const resultDiv = document.getElementById('result');
                // resultDiv.innerHTML = `
                //     <p>Current Location:</p>
                //     <p>Latitude: ${currentLocation.lat}</p>
                //     <p>Longitude: ${currentLocation.lng}</p>
                //     <p>Destination: ${destination}</p>
                //     <p>Destination Latitude: ${destinationLocation.lat}</p>
                //     <p>Destination Longitude: ${destinationLocation.lng}</p>
                //     <p>Departure Date: ${departureDate}</p>
                // `;

                // Use the Amadeus Location API to get IATA code for current location
                const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
                const clientSecret = 'FFRrmi8ZhebdbYXw';

                // Obtain an access token for current location
                fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
                })
                    .then(response => response.json())
                    .then(data => {
                        const accessToken = data.access_token;
                        const amadeusEndpointCurrent = `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&radius=500&page[limit]=10`;

                        setTimeout(function () {
                            // Use the access token to fetch the IATA codes for current location
                            fetch(amadeusEndpointCurrent, {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.data.length > 0) {
                                        const iataCodes = data.data.map(airport => airport.iataCode);
                                        const selectOptions = iataCodes.map(iataCode => `<option value="${iataCode}">${iataCode}</option>`).join('');
                                        resultDiv.innerHTML += `
                                        <p>Select Which Airport You Would Like To Use:</p>
                                        <select id="currentIataCodeSelect">
                                            ${selectOptions}
                                        </select>
                                    `;

                                        // Add event listener to the select element
                                        const currentIataCodeSelect = document.getElementById('currentIataCodeSelect');
                                        currentIataCodeSelect.addEventListener('change', function () {
                                            const selectedIataCode = currentIataCodeSelect.value;
                                            // Save selected IATA code in local storage
                                            localStorage.setItem('currentIataCode', selectedIataCode);
                                        });
                                    } else {
                                        console.error('No airports found near the current location.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error retrieving current location IATA codes:', error);
                                });
                        }, 100); // Add a 100ms timeout here

                        // Use the access token to fetch the IATA code for destination
                        setTimeout(function () {
                            fetch(`https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${destinationLocation.lat}&longitude=${destinationLocation.lng}&radius=50&page[limit]=1`, {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.data.length > 0) {
                                        const destinationIataCode = data.data[0].iataCode;
                                        // resultDiv.innerHTML += `<p>Destination IATA Code: ${destinationIataCode}</p>`;

                                        // Save destination location IATA code in local storage
                                        localStorage.setItem('destinationIataCode', destinationIataCode);
                                    } else {
                                        console.error('No airport found near the destination location.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error retrieving destination location IATA code:', error);
                                });
                        }, 100); // Add a 100ms timeout here
                    })
                    .catch(error => {
                        console.error('Error retrieving access token:', error);
                    });
            } else {
                console.error('No results found for the destination address.');
            }
        } else {
            console.error('Geocoder failed due to: ' + status);
        }
    });
}

// Add event listener to the form
const locationForm = document.getElementById('locationForm');
locationForm.addEventListener('submit', handleFormSubmission);

function nextPage() {
    if (
        localStorage.getItem('currentLocation') &&
        localStorage.getItem('destination') &&
        localStorage.getItem('departureDate') &&
        localStorage.getItem('destinationLocation') &&
        localStorage.getItem('currentIataCode') &&
        localStorage.getItem('destinationIataCode')
    ) {
        window.location.href = 'flight.html';
    } else {
        alert('Please fill in all the required information before proceeding.');
    }
}

// Redirect to the flight.html page
const flightPage = document.getElementById('flightPage');
flightPage.addEventListener('click', nextPage);


