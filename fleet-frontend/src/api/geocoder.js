/**
 * Simple Geocoding Utility using OpenStreetMap's free Nominatim API.
 * No API key required, but strict rate-limiting applies (1 request per second).
 */
export const geocodeCity = async (cityName) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to geocode city: ${cityName}`, error);
    return null;
  }
};
