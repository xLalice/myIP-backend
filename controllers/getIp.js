const axios = require("axios"); // Import axios
require("dotenv").config(); 


exports.getIp = async (req, res, next) => {
  try {
    // Checks if IP address is present in 'X-Forwarded-For' header
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // If the IP address is in an array format (may happen with 'X-Forwarded-For'), get the first IP address
    const ipString = Array.isArray(ip) ? ip[0] : ip;

    const ipAddresses = ipString.split(",").map((ip) => ip.trim());

    const isPrivateIp = (ip) =>
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

    const publicIp = ipAddresses.find((ip) => !isPrivateIp(ip));

    // Request URL for IPinfo API
    const ipinfoUrl = `https://ipinfo.io/${publicIp}/json?token=${process.env.IPINFO_API_KEY}`;
    console.log("IP Info URL: ", ipinfoUrl);

    // Fetch IP information from IPinfo using axios
    const response = await axios.get(ipinfoUrl);
    const data = response.data; // Access the response data directly

    // Check if latitude and longitude are available
    if (data.loc) {
      const [latitude, longitude] = data.loc.split(","); // Split 'loc' into latitude and longitude
      // Reply with the user's IP address, latitude, and longitude
      res.status(200).json({ ip: publicIp, latitude, longitude, city: data.city, country: data.country, region: data.region });
    } else {
      res.status(200).json({ ip: publicIp, message: "Location data not available" });
    }
  } catch (error) {
    console.error("Error fetching IP information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
