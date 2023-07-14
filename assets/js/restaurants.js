function initMap() {
    // Google Maps API initialization code here if needed
}

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the necessary data from localStorage
    const destinationLocation = JSON.parse(localStorage.getItem('destinationLocation'));

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
                            // const latitude = restaurant.geoCode.latitude;
                            // const longitude = restaurant.geoCode.longitude;

                            // Use the Google Maps Places API to search for the restaurant
                            const searchQuery = `${name} ${destinationLocation}`;
                            const request = {
                                query: searchQuery,
                                fields: ['name', 'formatted_address', 'geometry']
                            };

                            const service = new google.maps.places.PlacesService(document.createElement('div'));
                            service.findPlaceFromQuery(request, (results, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                                    const result = results[0];
                                    const address = result.formatted_address;
                                    const location = result.geometry.location;
                                    const formattedLocation = `${location.lat()}, ${location.lng()}`;

                                    const restaurantDiv = document.createElement('div');
                                    restaurantDiv.innerHTML = `
                      <div class="card-offers my-4 p-4 border border-black rounded shadow">
                        <h2 class="underline text-2xl bold">${name}</h2>
                        <p>Address: ${address}</p>
                        <p>Formatted Location: ${formattedLocation}</p>
                      </div>
                    `;

                                    restaurantList.appendChild(restaurantDiv);
                                } else {
                                    console.error(`No results found for search query: ${searchQuery}`);
                                }
                            });
                        });

                        // Add a button to go back and clear local storage
                        const backButton = document.createElement('button');
                        backButton.textContent = 'Back';
                        backButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded');
                        backButton.addEventListener('click', () => {
                            localStorage.clear();
                            window.location.href = 'index.html';
                        });

                        // Append the restaurant list and back button to a container element
                        const container = document.createElement('div');
                        container.appendChild(restaurantList);
                        container.appendChild(backButton);

                        // Append the container to the document body
                        document.body.appendChild(container);
                    }
                })
                .catch(error => {
                    console.error('Error retrieving nearby restaurants:', error);
                });
        })
        .catch(error => {
            console.error('Error retrieving access token:', error);
        });
});
