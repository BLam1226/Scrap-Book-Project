//   // Use the Amadeus Hotel List Search API to get flight price offers
document.addEventListener("DOMContentLoaded", function () {
  const clientId = "FCuoJwPQQVX99CewAG2cVyhpulqlG0dR";
  const clientSecret = "1Yzt1oz9AAsOW4yn";

  // Obtain the access token
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
      localStorage.setItem("data", JSON.stringify(data));
      console.log(data);
      const amadeusEndpoint =
        "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=41.397158&longitude=2.160873&radius=5&radiusUnit=MILE&ratings=2&hotelSource=ALL";

      fetch(amadeusEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          processHotels(data);

          return data;
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

// Function to process hotel name, rating and distance data
function processHotels(data) {
  var hotelDat = data.data;

  const hotelDiv = document.querySelector(".hotel");
  if (hotelDat && hotelDat.length > 0) {
    hotelDiv.innerHTML = `
    <h2>Hotels</h2>`;
    let count = 0;
    hotelDat.forEach((hotel) => {
      if (count < 5) {
        hotelDiv.innerHTML += `
              
              <p>Name: ${hotel.name}</p>
              <p>Rating: ${hotel.rating} stars</p>
              <p>Distance: ${hotel.distance.value} miles away</p>
              `;
        count++;
        console.log("HERE");
      }
    });
  }
  console.log(hotelDat);
}
