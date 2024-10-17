const axios = require("axios"); // Import axios
require("dotenv").config();

exports.getIp = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipString = Array.isArray(ip) ? ip[0] : ip;
    const ipAddresses = ipString.split(",").map((ip) => ip.trim());

    const isPrivateIp = (ip) =>
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

    const publicIp = ipAddresses.find((ip) => !isPrivateIp(ip));

    const ipinfoUrl = `https://ipinfo.io/${publicIp}/json?token=${process.env.IPINFO_API_KEY}`;
    console.log("IP Info URL: ", ipinfoUrl);

    const response = await axios.get(ipinfoUrl);
    const data = response.data;

    if (data.loc) {
      const [latitude, longitude] = data.loc.split(",");

      // Fetch nearby places using the newly created function
      const nearbyPlaces = await fetchNearbyPlaces(latitude, longitude);

      // Reply with the user's IP address, latitude, longitude, and nearby places
      res.status(200).json({
        ip: publicIp,
        latitude,
        longitude,
        city: data.city,
        country: data.country,
        region: data.region,
        nearbyPlaces, // Include nearby places in the response
      });
    } else {
      res
        .status(200)
        .json({ ip: publicIp, message: "Location data not available" });
    }
  } catch (error) {
    console.error("Error fetching IP information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchNearbyPlaces = async (latitude, longitude) => {
  try {
    const radius = 1500; // Define a search radius in meters
    const type = "restaurant|attraction"; // Specify types of places to fetch
    const apiKey = process.env.GOOGLE_PLACES_API_KEY; // Make sure to set this in your .env file

    // Build the Google Places API URL
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    // Fetch nearby places using axios
    const response = await axios.get(placesUrl);
    const places = response.data.results;

    // For each place, generate a photo URL if photos exist
    const enrichedPlaces = places.map((place) => {
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
        return { ...place, photoUrl }; // Add the photo URL to the place data
      }
      return place; // Return place without photo URL if no photos available
    });

    return enrichedPlaces; // Return the array of enriched places
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    throw error; // Re-throw the error for handling in the main function
  }
};
