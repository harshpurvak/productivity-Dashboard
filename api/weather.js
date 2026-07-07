module.exports = async function handler(request, response) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      message: "OPENWEATHER_API_KEY is not set in Vercel."
    });
  }

  const { lat, lon } = request.query;

  if (!lat || !lon) {
    return response.status(400).json({
      message: "Latitude and longitude are required."
    });
  }

  const params = new URLSearchParams({
    lat,
    lon,
    appid: apiKey,
    units: "metric"
  });

  try {
    const weatherResponse = await fetch(
      "https://api.openweathermap.org/data/2.5/weather?" + params.toString()
    );
    const data = await weatherResponse.json();

    return response.status(weatherResponse.status).json(data);
  } catch (error) {
    return response.status(502).json({
      message: "Could not reach OpenWeather right now."
    });
  }
};
