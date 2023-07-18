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
            // "startLocationCode": `${airportLocn}`,
            // "endGeoCode": `${hotelLocn}`,
            // "transferType": "TAXI",
            // "startDateTime": `${transferTime}`,

            "startLocationCode": "CDG",
            "endAddressLine": "Avenue Anatole France, 5",
            "endCityName": "Paris",
            "endZipCode": "75007",
            "endCountryCode": "FR",
            // "endName": "Souvenirs De La Tour",
            "endGooglePlaceId": "ChIJL-DOWeBv5kcRfTbh97PimNc",
            "endGeoCode": "48.859466,2.2976965",
            "transferType": "PRIVATE",
            "startDateTime": "2023-11-10T10:30:00",
            "currencyCode": "USD",
            // // "providerCodes": "TXO",
            // "passengers": 2,
            // "stopOvers": [
            //   {
            //     "duration": "PT2H30M",
            //     "sequenceNumber": 1,
            //     "addressLine": "Avenue de la Bourdonnais, 19",
            //     "countryCode": "FR",
            //     "cityName": "Paris",
            //     "zipCode": "75007",
            //     "googlePlaceId": "DOWeBv5kcRfTbh97PimN",
            //     "name": "De La Tours",
            //     "geoCode": "48.859477,2.2976985",
            //     "stateCode": "FR"
            //   }
            // ],
            // "startConnectedSegment": {
            //   "transportationType": "FLIGHT",
            //   "transportationNumber": "AF380",
            //   "departure": {
            //     "localDateTime": "2021-11-10T09:00:00",
            //     "iataCode": "NCE"
            //   },
            //   "arrival": {
            //     "localDateTime": "2021-11-10T10:00:00",
            //     "iataCode": "CDG"
            //   }
            // },
            // "passengerCharacteristics": [
            //   {
            //     "passengerTypeCode": "ADT",
            //     "age": 20
            //   },
            //   {
            //     "passengerTypeCode": "CHD",
            //     "age": 10
            //   }
            // ]
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
              console.log('function resolves');
              console.log(data);
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
    
    
    
    
    testButton = $('#test');
    testButton.on('click', searchTransferOffers);