// Add a button to go back
const backButton = document.createElement('button');
backButton.textContent = 'Home';
backButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
})
// Add a hidden button to go search for shuttles
const transferButton = document.createElement('button');
transferButton.textContent = 'Find Hotel Shuttle';
transferButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded', 'hidden');
transferButton.addEventListener('click', () => {
    window.location.href = 'transfer.html';
})
// Function to create a card element for each hotel
function createHotelCard(hotel) {
    const card = document.createElement('div');
    card.classList.add('bg-white', 'shadow-md', 'text-black', 'rounded', 'p-4', 'my-4');

    card.innerHTML = `
        <p>Name: ${hotel.name}</p>
        <p>Rating: ${hotel.rating} stars</p>
        <p>Distance: ${hotel.distance.value} miles away</p>
    `;

    // Add an event listener to the card to save the selected hotel data to localStorage when clicked
    card.addEventListener('click', () => {
        localStorage.setItem('selectedHotel', JSON.stringify(hotel));
        transferButton.classList.remove('hidden');
        alert("Hotel Selected");
    });

    return card;
}


// Function to process hotel name, rating and distance data
function processHotels(data) {
    const hotelDat = data.data;
    const hotelDiv = document.querySelector(".hotel");

    if (hotelDat && hotelDat.length > 0) {
        hotelDiv.innerHTML = `
            <h2>Hotels</h2>
        `;
        let count = 0;
        hotelDat.forEach((hotel) => {
            if (count < 5) {
                const hotelCard = createHotelCard(hotel);
                hotelDiv.appendChild(hotelCard);
                count++;
            }
        });
    }

    // Append the back button to the document body or a specific element, for example:
    const backDiv = document.querySelector(".back");
    backDiv.appendChild(backButton);

    // Append the hotel button to a specific element
    const transferDiv = document.querySelector(".transfer");
    transferDiv.appendChild(transferButton);
}

//   // Use the Amadeus Flight Offers Search API to get flight price offers
document.addEventListener("DOMContentLoaded", function () {
    const clientId = "FCuoJwPQQVX99CewAG2cVyhpulqlG0dR";
    const clientSecret = "1Yzt1oz9AAsOW4yn";
    // Retrieve the necessary data from localStorage
    const destinationLocation = JSON.parse(localStorage.getItem('destinationLocation'));

    // Obtain an access token
    fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    })
        .then((response) => response.json())
        .then((data) => {
            const accessToken = data.access_token;
            console.log(data);
            const amadeusEndpoint =
                `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${destinationLocation.lat}&longitude=${destinationLocation.lng}&radius=5&radiusUnit=MILE&ratings=2&hotelSource=ALL`;

            fetch(amadeusEndpoint, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    processHotels(data);

                })
                .catch((error) => {
                    console.error("Error retrieving hotel list:", error);
                    throw error;
                });
        })
        .catch((error) => {
            console.error("Error retrieving access token:", error);
            throw error;
        });
});


