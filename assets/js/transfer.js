// New Testy
var transferTime = '2023-11-11T11:00:00'
var airportLocn = 'SFO'
var hotelLocn = '37.6416222,-122.4194019'

console.log('page load')

// Function to search for flight price offers using the Amadeus API
async function searchTransferOffers(
  // transferTime, 
  // airportLocn, 
  // hotelLocn
  ) {
  // Use the Amadeus Flight Offers Search API to get flight price offers
  const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
  const clientSecret = 'FFRrmi8ZhebdbYXw';
  
  // Obtain an access token
  return fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.access_token;
      const amadeusEndpoint = `https://test.api.amadeus.com/v1/shopping/transfer-offers?startLocationCode=${airportLocn}&endGeoCode=${hotelLocn}&startDateTime=${transferTime}`;
      console.log(amadeusEndpoint);
      // Use the access token to fetch flight price offers
      return fetch(amadeusEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('function resolves');
          console.log(data);
          // return data;
        })
        .catch((error) => {
          console.error('Error retrieving flight price offers:', error);
          throw error;
        });
      })
      .catch((error) => {
        console.error('Error retrieving access token:', error);
        throw error;
      });
    }
    
    
    
    
    
    testButton = $('#test');
    testButton.on('click', searchTransferOffers);
    
    // // Testy
    // var currentLocation;
    // var destination;
    // var departureDate;
    // var destinationLocation;
    // var currentIataCode;
    // var destinationIataCode;
    
    // // Function to retrieve stored data from session storage
    // async function retrieveStoredData() {
    //   // Retrieve stored data from localStorage
    //   currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
    //   destination = localStorage.getItem('destination');
    //   departureDate = localStorage.getItem('departureDate');
    //   destinationLocation = JSON.parse(localStorage.getItem('destinationLocation'));
    //   currentIataCode = localStorage.getItem('currentIataCode');
    //   destinationIataCode = localStorage.getItem('destinationIataCode');
    //   console.log(currentLocation);
    //   console.log(destination);
    //   console.log(departureDate);
    //   console.log(destinationLocation);
    //   console.log(currentIataCode);
    //   console.log(destinationIataCode);
    // }
    
    
    // async function searchFlightPriceOffers(currentIataCode, destinationIataCode, departureDate) {
    //   console.log('function 2 called');
    //   // Use the Amadeus Flight Offers Search API to get flight price offers
    //   const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
    //   const clientSecret = 'FFRrmi8ZhebdbYXw';
    
    //   // Obtain an access token
    //   return fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    //   })
    //     .then((response) => response.json())
    //     .then((data) => {
    //       const accessToken = data.access_token;
    //       const amadeusEndpoint = `https://test.api.amadeus.com/v1/shopping/transfer-offers?`
    //       console.log(amadeusEndpoint);
    //     })
    // }