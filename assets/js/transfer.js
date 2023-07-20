// Html anchors
var cardLanding = $('#card-landing');
var waitMsg = $('#wait-msg');
var errMsg = $('#err-msg');

// Universal access point for vars
var transferDate;
var transferTime;
var airportLocn;
var selectedHotel;
var hotelLat;
var hotelLng;
var transferDestination;

// First step, retrieve airport and hotel data from local storage
function getInputs() {
  // Hide Restaurants button
  $('#go-restaurants').addClass('hidden');
  // Assign values to universal vars
  transferDate = localStorage.getItem('departureDate');
  transferTime = transferDate + 'T11:00:00';
  airportLocn = localStorage.getItem('destinationIataCode');
  selectedHotel = JSON.parse(localStorage.getItem('selectedHotel'));

  // Verify needed local storage data exists before proceeding
  if (transferTime && airportLocn && selectedHotel) {
    // Reformat geoCode data for Google API
    hotelLat = selectedHotel.geoCode.latitude;
    hotelLng = selectedHotel.geoCode.longitude;
    // Initiate next step, hotel coordinate conversion
    convertCoords();
  } else {
    // Post appropriate error messages if there is insufficient info to proceed
    waitMsg.text('Your search is lacking information!');
    if (!transferDate || !airportLocn) {
      errMsg.text('Please please to the previous page and enter a Destination and Departure Date.');
    } else if (!selectedHotel) {
      errMsg.text('Please select a hotel from the "Find Nearby Hotels" page before searching for a hotel shuttle.');
    } else {
      errMsg.text('Please return to the previous page and try again.');
    }
  }
}

// Next step, converting hotel coordinates into an address the Transfer Search API can read with Google GeoCoder API
async function convertCoords() {
  // Resources and formatting for Google GeoCoder API
  var googleKey = 'AIzaSyAdF7nQLNAAGL0HVRqeTJ0jPfrn9l-IgPg';
  var latlng = hotelLat + "," + hotelLng;

  // Fetch address data
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&location_type=ROOFTOP&result_type=street_address&key=${googleKey}`)
    .then((response) => response.json())
    .then((data) => {

      var streetNumber = data.results[0].address_components[0].long_name;
      var streetName = data.results[0].address_components[1].long_name;
      // Set univeral variable to object holding acquired data
      transferDestination = {
        addressLine: streetName + ", " + streetNumber,
        cityName: data.results[0].address_components[3].long_name,
        zipCode: data.results[0].address_components[7].long_name,
        countryCode: data.results[0].address_components[6].short_name,
        geoCode: latlng,
      }
      // Initiate final step, searching for transfer offers using Amadeus API
      searchTransferOffers();
    })
}


// Final step, searching for transfer offers using the Amadeus API and printing results to browser
async function searchTransferOffers() {

  // Resources for Amadeus API
  const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
  const clientSecret = 'FFRrmi8ZhebdbYXw';
  // Post wait message while while API call is resolving
  waitMsg.text('Searching for Shuttle offers, please wait...');

  // Obtain an access token
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      })
        .then((response) => response.json())
        .then((data) => {
          const accessToken = data.access_token;
          const amadeusEndpoint = 'https://test.api.amadeus.com/v1/shopping/transfer-offers';
          console.log(amadeusEndpoint);
          const params = {
            "startLocationCode": `${airportLocn}`,
            "endAddressLine": transferDestination.addressLine,
            "endCityName": transferDestination.cityName,
            "endZipCode": transferDestination.zipCode,
            "endCountryCode": transferDestination.countryCode,
            "endGeoCode": transferDestination.geoCode,
            "transferType": "PRIVATE",
            "startDateTime": `${transferTime}`,
            "currency": "USD",
          }

          // Use the access token to fetch transfer offers
          return fetch(amadeusEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
          })
            .then((response) => response.json())
            .then((data) => {
              // Clear wait message text
              waitMsg.text('');
              // Assess number of offers, limit number printed if needed
              var offersList = data.data.length
              if (offersList > 12) {
                offersList = 12;
              }
              // Print offers as cards and append to the document
              for (var i = 0; i < offersList; i++) {
                var transferCard = $(
                  `<div class="card-offers my-4 p-4 border border-black rounded shadow">
                    <p class="text-lg font-semibold">Shuttle Quote: ${data.data[i].converted.monetaryAmount} USD</p>
                    <p class="text-gray-600">Service Provider: ${data.data[i].serviceProvider.name.match(/[A-Z][a-z]+/g).join(" ")}</p>
                    <p class="text-gray-600">Vehicle: ${data.data[i].vehicle.description}</p>
                    <p class="text-gray-600">Seats: ${data.data[i].vehicle.seats[0].count}</p>
                  </div>`
                );
                cardLanding.append(transferCard);
              }
              
              // Add an event listener to each transfer card
              cardLanding.on('click', '.card-offers', function () {
                const selectedIndex = $(this).index();
                const selectedTransfer = data.data[selectedIndex];
                
                // Save the selected transfer in local storage
                localStorage.setItem('selectedTransfer', JSON.stringify(selectedTransfer));

                // Reveal Restaurants Button
                $('#go-restaurants').removeClass('hidden');
              });

              resolve(data);
            })
            .catch((error) => {
              console.error('Error retrieving flight price offers:', error);
              reject(error);
            });
        })
        .catch((error) => {
          console.error('Error retrieving access token:', error);
          reject(error);
        });
    }, 1000); // 1000 milliseconds timeout
  });
}

// Initiate first step on page load
document.addEventListener('DOMContentLoaded', getInputs);
// Clear any messages and go back to the index.html page
$('#go-back').on('click', function () {
  waitMsg.text('');
  errMsg.text('');
  window.location.href = 'index.html';
});
// Clear any messages and proceed to the restaurants.html page
$('#go-restaurants').on('click', function () {
  waitMsg.text('');
  errMsg.text('');
  window.location.href = 'restaurants.html';
});