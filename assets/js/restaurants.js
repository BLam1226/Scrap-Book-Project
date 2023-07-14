// Retrieve the necessary data from localStorage
const destinationLocation = JSON.parse(localStorage.getItem('destinationLocation'));
const destinationIataCode = localStorage.getItem('destinationIataCode');

// Perform a search for nearby restaurants using the Amadeus API
const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
const clientSecret = 'FFRrmi8ZhebdbYXw';
const amadeusEndpoint = `https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=${destinationLocation.lat}&longitude=${destinationLocation.lng}&radius=10&page%5Blimit%5D=10&page%5Boffset%5D=0&categories=RESTAURANT`;

// Obtain an access token for the Amadeus API
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

        // Use the access token to fetch nearby restaurants
        fetch(amadeusEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.data.length > 0) {
                    console.log(data.data);
                    // Display the list of nearby restaurants on the page
                    const restaurantList = document.getElementById('restaurantList');
                    const restaurants = data.data;
                    restaurants.forEach(restaurant => {
                        const name = restaurant.name;
                        const latitude = restaurant.geoCode.latitude;
                        const longitude = restaurant.geoCode.longitude;

                        const restaurantDiv = document.createElement('div');
                        restaurantDiv.innerHTML = `
                        <div class="card-offers my-4 p-4 border border-black rounded shadow">
                            <h2 class="underline text-2xl bold">${name}</h2>
                            <p>Latitude: ${latitude}</p>
                            <p>Longitude: ${longitude}</p>
                            </div>
                        `;

                        restaurantList.appendChild(restaurantDiv);
                    });
                    // Add a button to go back and clear local storage
                    const backButton = document.createElement('button');
                    backButton.textContent = 'Back';
                    backButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded');
                    backButton.addEventListener('click', () => {
                        localStorage.clear();
                        window.location.href = 'index.html';
                    });
                    restaurantList.appendChild(backButton);
                } else {
                    console.error('No restaurants found nearby.');
                    localStorage.clear()
                }
            })
            .catch(error => {
                console.error('Error retrieving nearby restaurants:', error);
            });
    })
    .catch(error => {
        console.error('Error retrieving access token:', error);
    });
