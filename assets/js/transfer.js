// Testy
// Boogie Woogie Woogie
var cardLanding = $('#card-landing');

// TODO Replace Test Values w prev values
var transferTime = '2023-11-11T11:00:00';
var airportLocn = 'PHL';
var hotelLocn = { lat: 39.954788, lng: -75.158859 };
var selectedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
var transferDestination

// var hotelLat = '39.954788';
// var hotelLng = '-75.158859';

console.log('page load');
console.log(selectedHotel);
console.log(selectedHotel.geocode);
console.log(selectedHotel.geocode.latitude);
console.log(selectedHotel.geocode.longitude);


async function convertCoords() {
  var googleKey = 'AIzaSyAdF7nQLNAAGL0HVRqeTJ0jPfrn9l-IgPg'
  var latlng = hotelLocn.lat + "," + hotelLocn.lng;
  console.log('convert function called');

  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&location_type=ROOFTOP&result_type=street_address&key=${googleKey}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.results[0].address_components);
      console.log('city: ' + data.results[0].address_components[3].long_name);
      console.log('street #: ' + data.results[0].address_components[0].long_name);
      console.log('street name: ' + data.results[0].address_components[1].long_name);
      console.log('zip: ' + data.results[0].address_components[7].long_name);
      console.log('country: ' + data.results[0].address_components[6].short_name);

      var streetNumber = data.results[0].address_components[0].long_name;
      var streetName = data.results[0].address_components[1].long_name;

      transferDestination = {
        addressLine: streetName + ", " + streetNumber,
        cityName: data.results[0].address_components[3].long_name,
        zipCode: data.results[0].address_components[7].long_name,
        countryCode: data.results[0].address_components[6].short_name,
        geocode: latlng,
      }
      // testytesty();
      searchTransferOffers();
    })
}


// Function to search for flight price offers using the Amadeus API
async function searchTransferOffers() {
  console.log('transfer function called');
  // testytesty();

  // Use the Amadeus Flight Offers Search API to get flight price offers
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
            "endGeoCode": transferDestination.geocode,
            "transferType": "PRIVATE",
            "startDateTime": `${transferTime}`,
            "currency": "USD",

            // "startLocationCode": 'PHL',
            // "endAddressLine": "Race Street, 1120",
            // "endCityName": "Philadelphia",
            // "endZipCode": "19107",
            // "endCountryCode": "US",
            // "endGeoCode": "39.954788,-75.158859",
            // "transferType": "PRIVATE",
            // "startDateTime": "2023-11-10T10:30:00",
            // "currency": "USD",
          }

          // Use the access token to fetch flight price offers
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
              // console.log('Provider String: ' + data.data[0].serviceProvider.name);
              // console.log('Provider Name: ' + data.data[0].serviceProvider.name.match(/[A-Z][a-z]+/g).join(" "));
              // console.log('Provider Logo: ' + data.data[0].serviceProvider.logoURL);
              // console.log('Quote: $' + data.data[0].converted.monetaryAmount);
              // console.log('Vehicle Desc: ' + data.data[0].vehicle.description);
              // console.log('Seats: ' + data.data[0].vehicle.seats[0].count);
              // console.log('Picture: ' + data.data[0].vehicle.imageURL);

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

// function testytesty() {
//   console.log(transferDestination);
//   console.log(typeof transferDestination.addressLine);
//   console.log(typeof transferDestination.cityName);
//   console.log(typeof transferDestination.zipCode);
//   console.log(typeof transferDestination.countryCode);
//   console.log(typeof transferDestination.geocode);
//   console.log(transferDestination.addressLine);
//   console.log(transferDestination.cityName);
//   console.log(transferDestination.zipCode);
//   console.log(transferDestination.countryCode);
//   console.log(transferDestination.geocode);
// }

// function testAll() {
//   try {
//     convertCoords()
//   } finally {
//     searchTransferOffers(transferDestination)
//   }
// }


// $('#test-locator').on('click', convertCoords);
// $('#test-transfer').on('click', searchTransferOffers);

function goBack() {
  window.location.href = 'index.html';
}

// $('#test-all').on('click', convertCoords);
document.addEventListener('DOMContentLoaded', convertCoords);
// Go back to the index.html page
$('#go-back').on('click', goBack);