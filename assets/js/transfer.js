// Variables
// TODO Add/edit notations for each step/section of code
var cardLanding = $('#card-landing');

// TODO Make page load conditional on localStorage vars
var transferTime = localStorage.getItem('departureDate') + 'T11:00:00';
var airportLocn = localStorage.getItem('destinationIataCode');
var selectedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
var hotelLat = selectedHotel.geoCode.latitude;
var hotelLng = selectedHotel.geoCode.longitude;
var transferDestination


console.log('page load');
console.log(selectedHotel);


async function convertCoords() {
  var googleKey = 'AIzaSyAdF7nQLNAAGL0HVRqeTJ0jPfrn9l-IgPg';
  var latlng = hotelLat + "," + hotelLng;

  console.log('convert function called');

  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&location_type=ROOFTOP&result_type=street_address&key=${googleKey}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.results[0].address_components);

      var streetNumber = data.results[0].address_components[0].long_name;
      var streetName = data.results[0].address_components[1].long_name;

      transferDestination = {
        addressLine: streetName + ", " + streetNumber,
        cityName: data.results[0].address_components[3].long_name,
        zipCode: data.results[0].address_components[7].long_name,
        countryCode: data.results[0].address_components[6].short_name,
        geoCode: latlng,
      }
      searchTransferOffers();
    })
}


// TODO Function to search for flight price offers using the Amadeus API
async function searchTransferOffers() {
  console.log('transfer function called');

  // TODO Use the Amadeus Flight Offers Search API to get flight price offers
  const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
  const clientSecret = 'FFRrmi8ZhebdbYXw';
  var waitMsg = $('#wait-msg');
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
              console.log('transfer function resolves');
              waitMsg.text('');
              console.log(data);

              var offersList = data.data.length
              if (offersList > 20) {
                offersList = 20;
              }

              for (var i = 0; i < offersList; i++) {
                var transferCard = $(
                  `<div class="card-offers my-4 p-4 border border-black rounded shadow">
                    <p class="text-lg font-semibold">Quote: ${data.data[i].converted.monetaryAmount} USD</p>
                   <p class="text-gray-600">Service Provider: ${data.data[i].serviceProvider.name.match(/[A-Z][a-z]+/g).join(" ")}</p>
                   <p class="text-gray-600">Vehicle: ${data.data[i].vehicle.description}</p>
                    <p class="text-gray-600">Seats: ${data.data[i].vehicle.seats[0].count}</p>
                  </div>`
                );
                cardLanding.append(transferCard);
              }

              resolve(data);

              // Add an event listener to each transfer card
              cardLanding.on('click', '.card-offers', function () {
                const selectedIndex = $(this).index();
                const selectedTransfer = data.data[selectedIndex];

                // Save the selected transfer in local storage
                localStorage.setItem('selectedTransfer', JSON.stringify(selectedTransfer));
              });
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


document.addEventListener('DOMContentLoaded', convertCoords);
// Go back to the index.html page
$('#go-back').on('click', function() {
  window.location.href = 'index.html';
});