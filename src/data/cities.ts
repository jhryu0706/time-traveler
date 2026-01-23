export interface City {
  name: string;
  country: string;
  timezone: string;
  alternateTimezones?: string[];
  lat: number;
  lng: number;
}

export const cities: City[] = [
  // === UTC-12 (Baker Island) ===
  // No major airports, closest is Fiji/Hawaii
  
  // === UTC-11 (Samoa Standard Time) ===
  { name: "Pago Pago", country: "American Samoa", timezone: "Pacific/Pago_Pago", lat: -14.2756, lng: -170.7020 },
  { name: "Apia", country: "Samoa", timezone: "Pacific/Apia", lat: -13.8333, lng: -171.7500 },
  
  // === UTC-10 (Hawaii-Aleutian) ===
  { name: "Honolulu", country: "United States", timezone: "Pacific/Honolulu", lat: 21.3069, lng: -157.8583 },
  { name: "Tahiti", country: "French Polynesia", timezone: "Pacific/Tahiti", lat: -17.6509, lng: -149.426 },
  
  // === UTC-9 (Alaska) ===
  { name: "Anchorage", country: "United States", timezone: "America/Anchorage", lat: 61.2181, lng: -149.9003 },
  { name: "Fairbanks", country: "United States", timezone: "America/Anchorage", lat: 64.8378, lng: -147.7164 },
  { name: "Juneau", country: "United States", timezone: "America/Juneau", lat: 58.3019, lng: -134.4197 },
  
  // === UTC-8 (Pacific Time) ===
  { name: "Los Angeles", country: "United States", timezone: "America/Los_Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "San Francisco", country: "United States", timezone: "America/Los_Angeles", lat: 37.7749, lng: -122.4194 },
  { name: "Seattle", country: "United States", timezone: "America/Los_Angeles", lat: 47.6062, lng: -122.3321 },
  { name: "Portland", country: "United States", timezone: "America/Los_Angeles", lat: 45.5152, lng: -122.6784 },
  { name: "San Diego", country: "United States", timezone: "America/Los_Angeles", lat: 32.7157, lng: -117.1611 },
  { name: "Las Vegas", country: "United States", timezone: "America/Los_Angeles", lat: 36.1699, lng: -115.1398 },
  { name: "San Jose", country: "United States", timezone: "America/Los_Angeles", lat: 37.3382, lng: -121.8863 },
  { name: "Sacramento", country: "United States", timezone: "America/Los_Angeles", lat: 38.5816, lng: -121.4944 },
  { name: "Vancouver", country: "Canada", timezone: "America/Vancouver", lat: 49.2827, lng: -123.1207 },
  { name: "Tijuana", country: "Mexico", timezone: "America/Tijuana", lat: 32.5149, lng: -117.0382 },
  
  // === UTC-7 (Mountain Time) ===
  { name: "Denver", country: "United States", timezone: "America/Denver", lat: 39.7392, lng: -104.9903 },
  { name: "Phoenix", country: "United States", timezone: "America/Phoenix", lat: 33.4484, lng: -112.074 },
  { name: "Salt Lake City", country: "United States", timezone: "America/Denver", lat: 40.7608, lng: -111.8910 },
  { name: "Albuquerque", country: "United States", timezone: "America/Denver", lat: 35.0844, lng: -106.6504 },
  { name: "Tucson", country: "United States", timezone: "America/Phoenix", lat: 32.2226, lng: -110.9747 },
  { name: "Calgary", country: "Canada", timezone: "America/Edmonton", lat: 51.0447, lng: -114.0719 },
  { name: "Edmonton", country: "Canada", timezone: "America/Edmonton", lat: 53.5461, lng: -113.4938 },
  
  // === UTC-6 (Central Time) ===
  { name: "Chicago", country: "United States", timezone: "America/Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Houston", country: "United States", timezone: "America/Chicago", lat: 29.7604, lng: -95.3698 },
  { name: "Dallas", country: "United States", timezone: "America/Chicago", lat: 32.7767, lng: -96.797 },
  { name: "Austin", country: "United States", timezone: "America/Chicago", lat: 30.2672, lng: -97.7431 },
  { name: "San Antonio", country: "United States", timezone: "America/Chicago", lat: 29.4241, lng: -98.4936 },
  { name: "Minneapolis", country: "United States", timezone: "America/Chicago", lat: 44.9778, lng: -93.265 },
  { name: "Nashville", country: "United States", timezone: "America/Chicago", lat: 36.1627, lng: -86.7816 },
  { name: "New Orleans", country: "United States", timezone: "America/Chicago", lat: 29.9511, lng: -90.0715 },
  { name: "Memphis", country: "United States", timezone: "America/Chicago", lat: 35.1495, lng: -90.049 },
  { name: "Milwaukee", country: "United States", timezone: "America/Chicago", lat: 43.0389, lng: -87.9065 },
  { name: "Kansas City", country: "United States", timezone: "America/Chicago", lat: 39.0997, lng: -94.5786 },
  { name: "St. Louis", country: "United States", timezone: "America/Chicago", lat: 38.6270, lng: -90.1994 },
  { name: "Oklahoma City", country: "United States", timezone: "America/Chicago", lat: 35.4676, lng: -97.5164 },
  { name: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", lat: 19.4326, lng: -99.1332 },
  { name: "Guadalajara", country: "Mexico", timezone: "America/Mexico_City", lat: 20.6597, lng: -103.3496 },
  { name: "Monterrey", country: "Mexico", timezone: "America/Monterrey", lat: 25.6866, lng: -100.3161 },
  { name: "Winnipeg", country: "Canada", timezone: "America/Winnipeg", lat: 49.8951, lng: -97.1384 },
  { name: "Guatemala City", country: "Guatemala", timezone: "America/Guatemala", lat: 14.6349, lng: -90.5069 },
  { name: "San Salvador", country: "El Salvador", timezone: "America/El_Salvador", lat: 13.6929, lng: -89.2182 },
  { name: "Tegucigalpa", country: "Honduras", timezone: "America/Tegucigalpa", lat: 14.0723, lng: -87.1921 },
  { name: "Managua", country: "Nicaragua", timezone: "America/Managua", lat: 12.1364, lng: -86.2514 },
  { name: "San José", country: "Costa Rica", timezone: "America/Costa_Rica", lat: 9.9281, lng: -84.0907 },
  
  // === UTC-5 (Eastern Time) ===
  { name: "New York", country: "United States", timezone: "America/New_York", lat: 40.7128, lng: -74.006 },
  { name: "Miami", country: "United States", timezone: "America/New_York", lat: 25.7617, lng: -80.1918 },
  { name: "Atlanta", country: "United States", timezone: "America/New_York", lat: 33.749, lng: -84.388 },
  { name: "Boston", country: "United States", timezone: "America/New_York", lat: 42.3601, lng: -71.0589 },
  { name: "Philadelphia", country: "United States", timezone: "America/New_York", lat: 39.9526, lng: -75.1652 },
  { name: "Washington", country: "United States", timezone: "America/New_York", lat: 38.9072, lng: -77.0369 },
  { name: "Orlando", country: "United States", timezone: "America/New_York", lat: 28.5383, lng: -81.3792 },
  { name: "Tampa", country: "United States", timezone: "America/New_York", lat: 27.9506, lng: -82.4572 },
  { name: "Detroit", country: "United States", timezone: "America/Detroit", lat: 42.3314, lng: -83.0458 },
  { name: "Charlotte", country: "United States", timezone: "America/New_York", lat: 35.2271, lng: -80.8431 },
  { name: "Cleveland", country: "United States", timezone: "America/New_York", lat: 41.4993, lng: -81.6944 },
  { name: "Baltimore", country: "United States", timezone: "America/New_York", lat: 39.2904, lng: -76.6122 },
  { name: "Indianapolis", country: "United States", timezone: "America/Indiana/Indianapolis", lat: 39.7684, lng: -86.1581 },
  { name: "Columbus", country: "United States", timezone: "America/New_York", lat: 39.9612, lng: -82.9988 },
  { name: "Pittsburgh", country: "United States", timezone: "America/New_York", lat: 40.4406, lng: -79.9959 },
  { name: "Raleigh", country: "United States", timezone: "America/New_York", lat: 35.7796, lng: -78.6382 },
  { name: "Toronto", country: "Canada", timezone: "America/Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Montreal", country: "Canada", timezone: "America/Montreal", lat: 45.5017, lng: -73.5673 },
  { name: "Ottawa", country: "Canada", timezone: "America/Toronto", lat: 45.4215, lng: -75.6972 },
  { name: "Havana", country: "Cuba", timezone: "America/Havana", lat: 23.1136, lng: -82.3666 },
  { name: "Bogotá", country: "Colombia", timezone: "America/Bogota", lat: 4.711, lng: -74.0721 },
  { name: "Lima", country: "Peru", timezone: "America/Lima", lat: -12.0464, lng: -77.0428 },
  { name: "Quito", country: "Ecuador", timezone: "America/Guayaquil", lat: -0.1807, lng: -78.4678 },
  { name: "Panama City", country: "Panama", timezone: "America/Panama", lat: 8.9824, lng: -79.5199 },
  { name: "Kingston", country: "Jamaica", timezone: "America/Jamaica", lat: 18.0179, lng: -76.8099 },
  { name: "Nassau", country: "Bahamas", timezone: "America/Nassau", lat: 25.0343, lng: -77.3963 },
  { name: "Cancun", country: "Mexico", timezone: "America/Cancun", lat: 21.1619, lng: -86.8515 },
  
  // === UTC-4 (Atlantic Time) ===
  { name: "Halifax", country: "Canada", timezone: "America/Halifax", lat: 44.6488, lng: -63.5752 },
  { name: "San Juan", country: "Puerto Rico", timezone: "America/Puerto_Rico", lat: 18.4655, lng: -66.1057 },
  { name: "Caracas", country: "Venezuela", timezone: "America/Caracas", lat: 10.4806, lng: -66.9036 },
  { name: "Santo Domingo", country: "Dominican Republic", timezone: "America/Santo_Domingo", lat: 18.4861, lng: -69.9312 },
  { name: "La Paz", country: "Bolivia", timezone: "America/La_Paz", lat: -16.4897, lng: -68.1193 },
  { name: "Manaus", country: "Brazil", timezone: "America/Manaus", lat: -3.119, lng: -60.0217 },
  { name: "Bridgetown", country: "Barbados", timezone: "America/Barbados", lat: 13.0969, lng: -59.6145 },
  { name: "Port of Spain", country: "Trinidad and Tobago", timezone: "America/Port_of_Spain", lat: 10.6596, lng: -61.5086 },
  { name: "Curaçao", country: "Curaçao", timezone: "America/Curacao", lat: 12.1696, lng: -68.9900 },
  
  // === UTC-3 (Argentina, Brazil) ===
  { name: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro", country: "Brazil", timezone: "America/Sao_Paulo", lat: -22.9068, lng: -43.1729 },
  { name: "Brasília", country: "Brazil", timezone: "America/Sao_Paulo", lat: -15.8267, lng: -47.9218 },
  { name: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", lat: -34.6037, lng: -58.3816 },
  { name: "Santiago", country: "Chile", timezone: "America/Santiago", lat: -33.4489, lng: -70.6693 },
  { name: "Montevideo", country: "Uruguay", timezone: "America/Montevideo", lat: -34.9011, lng: -56.1645 },
  { name: "Asunción", country: "Paraguay", timezone: "America/Asuncion", lat: -25.2637, lng: -57.5759 },
  { name: "Fortaleza", country: "Brazil", timezone: "America/Fortaleza", lat: -3.7172, lng: -38.5433 },
  { name: "Salvador", country: "Brazil", timezone: "America/Bahia", lat: -12.9714, lng: -38.5014 },
  { name: "Recife", country: "Brazil", timezone: "America/Recife", lat: -8.0476, lng: -34.8770 },
  { name: "Medellín", country: "Colombia", timezone: "America/Bogota", lat: 6.2442, lng: -75.5812 },
  { name: "Córdoba", country: "Argentina", timezone: "America/Argentina/Cordoba", lat: -31.4201, lng: -64.1888 },
  
  // === UTC-2 (Mid-Atlantic) ===
  { name: "Fernando de Noronha", country: "Brazil", timezone: "America/Noronha", lat: -3.8544, lng: -32.4297 },
  
  // === UTC-1 (Azores) ===
  { name: "Azores", country: "Portugal", timezone: "Atlantic/Azores", lat: 37.7412, lng: -25.6756 },
  { name: "Praia", country: "Cape Verde", timezone: "Atlantic/Cape_Verde", lat: 14.9315, lng: -23.5133 },
  
  // === UTC+0 (GMT/WET) ===
  { name: "London", country: "United Kingdom", timezone: "Europe/London", lat: 51.5074, lng: -0.1278 },
  { name: "Dublin", country: "Ireland", timezone: "Europe/Dublin", lat: 53.3498, lng: -6.2603 },
  { name: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", lat: 38.7223, lng: -9.1393 },
  { name: "Casablanca", country: "Morocco", timezone: "Africa/Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Accra", country: "Ghana", timezone: "Africa/Accra", lat: 5.6037, lng: -0.187 },
  { name: "Dakar", country: "Senegal", timezone: "Africa/Dakar", lat: 14.7167, lng: -17.4677 },
  { name: "Reykjavik", country: "Iceland", timezone: "Atlantic/Reykjavik", lat: 64.1466, lng: -21.9426 },
  { name: "Manchester", country: "United Kingdom", timezone: "Europe/London", lat: 53.4808, lng: -2.2426 },
  { name: "Birmingham", country: "United Kingdom", timezone: "Europe/London", lat: 52.4862, lng: -1.8904 },
  { name: "Edinburgh", country: "United Kingdom", timezone: "Europe/London", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", country: "United Kingdom", timezone: "Europe/London", lat: 55.8642, lng: -4.2518 },
  { name: "Porto", country: "Portugal", timezone: "Europe/Lisbon", lat: 41.1579, lng: -8.6291 },
  { name: "Marrakech", country: "Morocco", timezone: "Africa/Casablanca", lat: 31.6295, lng: -7.9811 },
  
  // === UTC+1 (CET) ===
  { name: "Paris", country: "France", timezone: "Europe/Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", country: "Germany", timezone: "Europe/Berlin", lat: 52.52, lng: 13.405 },
  { name: "Rome", country: "Italy", timezone: "Europe/Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", country: "Spain", timezone: "Europe/Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Brussels", country: "Belgium", timezone: "Europe/Brussels", lat: 50.8503, lng: 4.3517 },
  { name: "Vienna", country: "Austria", timezone: "Europe/Vienna", lat: 48.2082, lng: 16.3738 },
  { name: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", lat: 47.3769, lng: 8.5417 },
  { name: "Munich", country: "Germany", timezone: "Europe/Berlin", lat: 48.1351, lng: 11.582 },
  { name: "Frankfurt", country: "Germany", timezone: "Europe/Berlin", lat: 50.1109, lng: 8.6821 },
  { name: "Milan", country: "Italy", timezone: "Europe/Rome", lat: 45.4642, lng: 9.19 },
  { name: "Barcelona", country: "Spain", timezone: "Europe/Madrid", lat: 41.3851, lng: 2.1734 },
  { name: "Prague", country: "Czech Republic", timezone: "Europe/Prague", lat: 50.0755, lng: 14.4378 },
  { name: "Warsaw", country: "Poland", timezone: "Europe/Warsaw", lat: 52.2297, lng: 21.0122 },
  { name: "Budapest", country: "Hungary", timezone: "Europe/Budapest", lat: 47.4979, lng: 19.0402 },
  { name: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen", lat: 55.6761, lng: 12.5683 },
  { name: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", lat: 59.3293, lng: 18.0686 },
  { name: "Oslo", country: "Norway", timezone: "Europe/Oslo", lat: 59.9139, lng: 10.7522 },
  { name: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Algiers", country: "Algeria", timezone: "Africa/Algiers", lat: 36.7538, lng: 3.0588 },
  { name: "Tunis", country: "Tunisia", timezone: "Africa/Tunis", lat: 36.8065, lng: 10.1815 },
  { name: "Geneva", country: "Switzerland", timezone: "Europe/Zurich", lat: 46.2044, lng: 6.1432 },
  { name: "Lyon", country: "France", timezone: "Europe/Paris", lat: 45.764, lng: 4.8357 },
  { name: "Nice", country: "France", timezone: "Europe/Paris", lat: 43.7102, lng: 7.262 },
  { name: "Hamburg", country: "Germany", timezone: "Europe/Berlin", lat: 53.5511, lng: 9.9937 },
  { name: "Cologne", country: "Germany", timezone: "Europe/Berlin", lat: 50.9375, lng: 6.9603 },
  { name: "Düsseldorf", country: "Germany", timezone: "Europe/Berlin", lat: 51.2277, lng: 6.7735 },
  { name: "Naples", country: "Italy", timezone: "Europe/Rome", lat: 40.8518, lng: 14.2681 },
  { name: "Venice", country: "Italy", timezone: "Europe/Rome", lat: 45.4408, lng: 12.3155 },
  { name: "Florence", country: "Italy", timezone: "Europe/Rome", lat: 43.7696, lng: 11.2558 },
  { name: "Valencia", country: "Spain", timezone: "Europe/Madrid", lat: 39.4699, lng: -0.3763 },
  { name: "Seville", country: "Spain", timezone: "Europe/Madrid", lat: 37.3891, lng: -5.9845 },
  { name: "Rotterdam", country: "Netherlands", timezone: "Europe/Amsterdam", lat: 51.9244, lng: 4.4777 },
  { name: "Krakow", country: "Poland", timezone: "Europe/Warsaw", lat: 50.0647, lng: 19.945 },
  { name: "Zagreb", country: "Croatia", timezone: "Europe/Zagreb", lat: 45.815, lng: 15.9819 },
  { name: "Ljubljana", country: "Slovenia", timezone: "Europe/Ljubljana", lat: 46.0569, lng: 14.5058 },
  { name: "Bratislava", country: "Slovakia", timezone: "Europe/Bratislava", lat: 48.1486, lng: 17.1077 },
  { name: "Belgrade", country: "Serbia", timezone: "Europe/Belgrade", lat: 44.7866, lng: 20.4489 },
  { name: "Abuja", country: "Nigeria", timezone: "Africa/Lagos", lat: 9.0765, lng: 7.3986 },
  { name: "Luanda", country: "Angola", timezone: "Africa/Luanda", lat: -8.8390, lng: 13.2894 },
  { name: "Kinshasa", country: "DR Congo", timezone: "Africa/Kinshasa", lat: -4.4419, lng: 15.2663 },
  { name: "Douala", country: "Cameroon", timezone: "Africa/Douala", lat: 4.0511, lng: 9.7679 },
  
  // === UTC+2 (EET) ===
  { name: "Cairo", country: "Egypt", timezone: "Africa/Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Athens", country: "Greece", timezone: "Europe/Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Bucharest", country: "Romania", timezone: "Europe/Bucharest", lat: 44.4268, lng: 26.1025 },
  { name: "Helsinki", country: "Finland", timezone: "Europe/Helsinki", lat: 60.1699, lng: 24.9384 },
  { name: "Kyiv", country: "Ukraine", timezone: "Europe/Kyiv", lat: 50.4501, lng: 30.5234 },
  { name: "Tel Aviv", country: "Israel", timezone: "Asia/Jerusalem", lat: 32.0853, lng: 34.7818 },
  { name: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", country: "South Africa", timezone: "Africa/Johannesburg", lat: -33.9249, lng: 18.4241 },
  { name: "Sofia", country: "Bulgaria", timezone: "Europe/Sofia", lat: 42.6977, lng: 23.3219 },
  { name: "Tallinn", country: "Estonia", timezone: "Europe/Tallinn", lat: 59.437, lng: 24.7536 },
  { name: "Riga", country: "Latvia", timezone: "Europe/Riga", lat: 56.9496, lng: 24.1052 },
  { name: "Vilnius", country: "Lithuania", timezone: "Europe/Vilnius", lat: 54.6872, lng: 25.2797 },
  { name: "Alexandria", country: "Egypt", timezone: "Africa/Cairo", lat: 31.2001, lng: 29.9187 },
  { name: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Durban", country: "South Africa", timezone: "Africa/Johannesburg", lat: -29.8587, lng: 31.0218 },
  { name: "Harare", country: "Zimbabwe", timezone: "Africa/Harare", lat: -17.8252, lng: 31.0335 },
  { name: "Lusaka", country: "Zambia", timezone: "Africa/Lusaka", lat: -15.3875, lng: 28.3228 },
  { name: "Kigali", country: "Rwanda", timezone: "Africa/Kigali", lat: -1.9403, lng: 29.8739 },
  { name: "Kampala", country: "Uganda", timezone: "Africa/Kampala", lat: 0.3476, lng: 32.5825 },
  { name: "Jerusalem", country: "Israel", timezone: "Asia/Jerusalem", lat: 31.7683, lng: 35.2137 },
  { name: "Amman", country: "Jordan", timezone: "Asia/Amman", lat: 31.9454, lng: 35.9284 },
  { name: "Beirut", country: "Lebanon", timezone: "Asia/Beirut", lat: 33.8938, lng: 35.5018 },
  { name: "Damascus", country: "Syria", timezone: "Asia/Damascus", lat: 33.5138, lng: 36.2765 },
  
  // === UTC+3 (MSK, Arabia) ===
  { name: "Moscow", country: "Russia", timezone: "Europe/Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh", lat: 24.7136, lng: 46.6753 },
  { name: "Doha", country: "Qatar", timezone: "Asia/Qatar", lat: 25.2854, lng: 51.531 },
  { name: "Kuwait City", country: "Kuwait", timezone: "Asia/Kuwait", lat: 29.3759, lng: 47.9774 },
  { name: "Saint Petersburg", country: "Russia", timezone: "Europe/Moscow", lat: 59.9343, lng: 30.3351 },
  { name: "Minsk", country: "Belarus", timezone: "Europe/Minsk", lat: 53.9006, lng: 27.559 },
  { name: "Ankara", country: "Turkey", timezone: "Europe/Istanbul", lat: 39.9334, lng: 32.8597 },
  { name: "Jeddah", country: "Saudi Arabia", timezone: "Asia/Riyadh", lat: 21.4858, lng: 39.1925 },
  { name: "Abu Dhabi", country: "United Arab Emirates", timezone: "Asia/Dubai", lat: 24.4539, lng: 54.3773 },
  { name: "Bahrain", country: "Bahrain", timezone: "Asia/Bahrain", lat: 26.2285, lng: 50.586 },
  { name: "Muscat", country: "Oman", timezone: "Asia/Muscat", lat: 23.588, lng: 58.3829 },
  { name: "Addis Ababa", country: "Ethiopia", timezone: "Africa/Addis_Ababa", lat: 8.9806, lng: 38.7578 },
  { name: "Dar es Salaam", country: "Tanzania", timezone: "Africa/Dar_es_Salaam", lat: -6.7924, lng: 39.2083 },
  { name: "Mombasa", country: "Kenya", timezone: "Africa/Nairobi", lat: -4.0435, lng: 39.6682 },
  { name: "Izmir", country: "Turkey", timezone: "Europe/Istanbul", lat: 38.4237, lng: 27.1428 },
  { name: "Antalya", country: "Turkey", timezone: "Europe/Istanbul", lat: 36.8969, lng: 30.7133 },
  { name: "Baghdad", country: "Iraq", timezone: "Asia/Baghdad", lat: 33.3152, lng: 44.3661 },
  
  // === UTC+3:30 (Iran) ===
  { name: "Tehran", country: "Iran", timezone: "Asia/Tehran", lat: 35.6892, lng: 51.389 },
  { name: "Mashhad", country: "Iran", timezone: "Asia/Tehran", lat: 36.2605, lng: 59.6168 },
  { name: "Isfahan", country: "Iran", timezone: "Asia/Tehran", lat: 32.6546, lng: 51.6680 },
  { name: "Shiraz", country: "Iran", timezone: "Asia/Tehran", lat: 29.5918, lng: 52.5837 },
  
  // === UTC+4 (Gulf, Caucasus) ===
  { name: "Baku", country: "Azerbaijan", timezone: "Asia/Baku", lat: 40.4093, lng: 49.8671 },
  { name: "Tbilisi", country: "Georgia", timezone: "Asia/Tbilisi", lat: 41.7151, lng: 44.8271 },
  { name: "Yerevan", country: "Armenia", timezone: "Asia/Yerevan", lat: 40.1792, lng: 44.4991 },
  { name: "Mauritius", country: "Mauritius", timezone: "Indian/Mauritius", lat: -20.1609, lng: 57.5012 },
  { name: "Seychelles", country: "Seychelles", timezone: "Indian/Mahe", lat: -4.6796, lng: 55.4920 },
  { name: "Samara", country: "Russia", timezone: "Europe/Samara", lat: 53.1959, lng: 50.1002 },
  
  // === UTC+4:30 (Afghanistan) ===
  { name: "Kabul", country: "Afghanistan", timezone: "Asia/Kabul", lat: 34.5553, lng: 69.2075 },
  
  // === UTC+5 (Pakistan, West Kazakhstan) ===
  { name: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", country: "Pakistan", timezone: "Asia/Karachi", lat: 31.5204, lng: 74.3587 },
  { name: "Islamabad", country: "Pakistan", timezone: "Asia/Karachi", lat: 33.6844, lng: 73.0479 },
  { name: "Tashkent", country: "Uzbekistan", timezone: "Asia/Tashkent", lat: 41.2995, lng: 69.2401 },
  { name: "Almaty", country: "Kazakhstan", timezone: "Asia/Almaty", lat: 43.2389, lng: 76.9456 },
  { name: "Male", country: "Maldives", timezone: "Indian/Maldives", lat: 4.1755, lng: 73.5093 },
  { name: "Yekaterinburg", country: "Russia", timezone: "Asia/Yekaterinburg", lat: 56.8389, lng: 60.6057 },
  { name: "Dushanbe", country: "Tajikistan", timezone: "Asia/Dushanbe", lat: 38.5598, lng: 68.7740 },
  { name: "Ashgabat", country: "Turkmenistan", timezone: "Asia/Ashgabat", lat: 37.9601, lng: 58.3261 },
  
  // === UTC+5:30 (India, Sri Lanka) ===
  { name: "Mumbai", country: "India", timezone: "Asia/Kolkata", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", country: "India", timezone: "Asia/Kolkata", lat: 28.6139, lng: 77.209 },
  { name: "Bangalore", country: "India", timezone: "Asia/Kolkata", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", country: "India", timezone: "Asia/Kolkata", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", country: "India", timezone: "Asia/Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Hyderabad", country: "India", timezone: "Asia/Kolkata", lat: 17.385, lng: 78.4867 },
  { name: "Ahmedabad", country: "India", timezone: "Asia/Kolkata", lat: 23.0225, lng: 72.5714 },
  { name: "Pune", country: "India", timezone: "Asia/Kolkata", lat: 18.5204, lng: 73.8567 },
  { name: "Jaipur", country: "India", timezone: "Asia/Kolkata", lat: 26.9124, lng: 75.7873 },
  { name: "Colombo", country: "Sri Lanka", timezone: "Asia/Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Goa", country: "India", timezone: "Asia/Kolkata", lat: 15.2993, lng: 74.124 },
  { name: "Kochi", country: "India", timezone: "Asia/Kolkata", lat: 9.9312, lng: 76.2673 },
  
  // === UTC+5:45 (Nepal) ===
  { name: "Kathmandu", country: "Nepal", timezone: "Asia/Kathmandu", lat: 27.7172, lng: 85.324 },
  
  // === UTC+6 (Bangladesh, Central Asia) ===
  { name: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Novosibirsk", country: "Russia", timezone: "Asia/Novosibirsk", lat: 55.0084, lng: 82.9357 },
  { name: "Chittagong", country: "Bangladesh", timezone: "Asia/Dhaka", lat: 22.3569, lng: 91.7832 },
  { name: "Astana", country: "Kazakhstan", timezone: "Asia/Almaty", lat: 51.1694, lng: 71.4491 },
  { name: "Bishkek", country: "Kyrgyzstan", timezone: "Asia/Bishkek", lat: 42.8746, lng: 74.5698 },
  { name: "Thimphu", country: "Bhutan", timezone: "Asia/Thimphu", lat: 27.4728, lng: 89.6390 },
  
  // === UTC+6:30 (Myanmar) ===
  { name: "Yangon", country: "Myanmar", timezone: "Asia/Yangon", lat: 16.8661, lng: 96.1951 },
  { name: "Mandalay", country: "Myanmar", timezone: "Asia/Yangon", lat: 21.9588, lng: 96.0891 },
  
  // === UTC+7 (Indochina) ===
  { name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", lat: 13.7563, lng: 100.5018 },
  { name: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", lat: 10.8231, lng: 106.6297 },
  { name: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", lat: 21.0285, lng: 105.8542 },
  { name: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", lat: -6.2088, lng: 106.8456 },
  { name: "Phnom Penh", country: "Cambodia", timezone: "Asia/Phnom_Penh", lat: 11.5564, lng: 104.9282 },
  { name: "Phuket", country: "Thailand", timezone: "Asia/Bangkok", lat: 7.8804, lng: 98.3923 },
  { name: "Chiang Mai", country: "Thailand", timezone: "Asia/Bangkok", lat: 18.7883, lng: 98.9853 },
  { name: "Da Nang", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", lat: 16.0544, lng: 108.2022 },
  { name: "Vientiane", country: "Laos", timezone: "Asia/Vientiane", lat: 17.9757, lng: 102.6331 },
  { name: "Krasnoyarsk", country: "Russia", timezone: "Asia/Krasnoyarsk", lat: 56.0153, lng: 92.8932 },
  { name: "Surabaya", country: "Indonesia", timezone: "Asia/Jakarta", lat: -7.2575, lng: 112.7521 },
  
  // === UTC+8 (China, Singapore, Western Australia) ===
  { name: "Singapore", country: "Singapore", timezone: "Asia/Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Hong Kong", country: "Hong Kong", timezone: "Asia/Hong_Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Beijing", country: "China", timezone: "Asia/Shanghai", lat: 39.9042, lng: 116.4074 },
  { name: "Shanghai", country: "China", timezone: "Asia/Shanghai", lat: 31.2304, lng: 121.4737 },
  { name: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", lat: 3.139, lng: 101.6869 },
  { name: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", lat: 25.033, lng: 121.5654 },
  { name: "Perth", country: "Australia", timezone: "Australia/Perth", lat: -31.9505, lng: 115.8605 },
  { name: "Manila", country: "Philippines", timezone: "Asia/Manila", lat: 14.5995, lng: 120.9842 },
  { name: "Guangzhou", country: "China", timezone: "Asia/Shanghai", lat: 23.1291, lng: 113.2644 },
  { name: "Shenzhen", country: "China", timezone: "Asia/Shanghai", lat: 22.5431, lng: 114.0579 },
  { name: "Macau", country: "Macau", timezone: "Asia/Macau", lat: 22.1987, lng: 113.5439 },
  { name: "Bali", country: "Indonesia", timezone: "Asia/Makassar", lat: -8.3405, lng: 115.092 },
  { name: "Penang", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", lat: 5.4164, lng: 100.3327 },
  { name: "Cebu", country: "Philippines", timezone: "Asia/Manila", lat: 10.3157, lng: 123.8854 },
  { name: "Chengdu", country: "China", timezone: "Asia/Shanghai", lat: 30.5728, lng: 104.0668 },
  { name: "Hangzhou", country: "China", timezone: "Asia/Shanghai", lat: 30.2741, lng: 120.1551 },
  { name: "Xi'an", country: "China", timezone: "Asia/Shanghai", lat: 34.3416, lng: 108.9398 },
  { name: "Nanjing", country: "China", timezone: "Asia/Shanghai", lat: 32.0603, lng: 118.7969 },
  { name: "Ulaanbaatar", country: "Mongolia", timezone: "Asia/Ulaanbaatar", lat: 47.8864, lng: 106.9057 },
  { name: "Irkutsk", country: "Russia", timezone: "Asia/Irkutsk", lat: 52.2870, lng: 104.3050 },
  { name: "Brunei", country: "Brunei", timezone: "Asia/Brunei", lat: 4.9031, lng: 114.9398 },
  
  // === UTC+9 (Japan, Korea) ===
  { name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", lat: 37.5665, lng: 126.978 },
  { name: "Osaka", country: "Japan", timezone: "Asia/Tokyo", lat: 34.6937, lng: 135.5023 },
  { name: "Busan", country: "South Korea", timezone: "Asia/Seoul", lat: 35.1796, lng: 129.0756 },
  { name: "Nagoya", country: "Japan", timezone: "Asia/Tokyo", lat: 35.1815, lng: 136.9066 },
  { name: "Fukuoka", country: "Japan", timezone: "Asia/Tokyo", lat: 33.5904, lng: 130.4017 },
  { name: "Sapporo", country: "Japan", timezone: "Asia/Tokyo", lat: 43.0618, lng: 141.3545 },
  { name: "Kyoto", country: "Japan", timezone: "Asia/Tokyo", lat: 35.0116, lng: 135.7681 },
  { name: "Yakutsk", country: "Russia", timezone: "Asia/Yakutsk", lat: 62.0355, lng: 129.6755 },
  { name: "Jayapura", country: "Indonesia", timezone: "Asia/Jayapura", lat: -2.5916, lng: 140.6690 },
  { name: "Palau", country: "Palau", timezone: "Pacific/Palau", lat: 7.5150, lng: 134.5825 },
  { name: "Dili", country: "East Timor", timezone: "Asia/Dili", lat: -8.5569, lng: 125.5603 },
  
  // === UTC+9:30 (Central Australia) ===
  { name: "Adelaide", country: "Australia", timezone: "Australia/Adelaide", lat: -34.9285, lng: 138.6007 },
  { name: "Darwin", country: "Australia", timezone: "Australia/Darwin", lat: -12.4634, lng: 130.8456 },
  
  // === UTC+10 (Eastern Australia, Guam) ===
  { name: "Sydney", country: "Australia", timezone: "Australia/Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", lat: -37.8136, lng: 144.9631 },
  { name: "Brisbane", country: "Australia", timezone: "Australia/Brisbane", lat: -27.4698, lng: 153.0251 },
  { name: "Guam", country: "Guam", timezone: "Pacific/Guam", lat: 13.4443, lng: 144.7937 },
  { name: "Vladivostok", country: "Russia", timezone: "Asia/Vladivostok", lat: 43.1332, lng: 131.9113 },
  { name: "Port Moresby", country: "Papua New Guinea", timezone: "Pacific/Port_Moresby", lat: -9.4438, lng: 147.1803 },
  { name: "Cairns", country: "Australia", timezone: "Australia/Brisbane", lat: -16.9186, lng: 145.7781 },
  { name: "Gold Coast", country: "Australia", timezone: "Australia/Brisbane", lat: -28.0167, lng: 153.4000 },
  { name: "Canberra", country: "Australia", timezone: "Australia/Sydney", lat: -35.2809, lng: 149.1300 },
  { name: "Hobart", country: "Australia", timezone: "Australia/Hobart", lat: -42.8821, lng: 147.3272 },
  
  // === UTC+11 (Solomon Islands, New Caledonia) ===
  { name: "Nouméa", country: "New Caledonia", timezone: "Pacific/Noumea", lat: -22.2735, lng: 166.4580 },
  { name: "Honiara", country: "Solomon Islands", timezone: "Pacific/Guadalcanal", lat: -9.4456, lng: 159.9729 },
  { name: "Magadan", country: "Russia", timezone: "Asia/Magadan", lat: 59.5612, lng: 150.8081 },
  { name: "Vanuatu", country: "Vanuatu", timezone: "Pacific/Efate", lat: -17.7333, lng: 168.3167 },
  
  // === UTC+12 (New Zealand, Fiji) ===
  { name: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", lat: -36.8509, lng: 174.7645 },
  { name: "Wellington", country: "New Zealand", timezone: "Pacific/Auckland", lat: -41.2865, lng: 174.7762 },
  { name: "Fiji", country: "Fiji", timezone: "Pacific/Fiji", lat: -17.7134, lng: 178.065 },
  { name: "Christchurch", country: "New Zealand", timezone: "Pacific/Auckland", lat: -43.532, lng: 172.6306 },
  { name: "Petropavlovsk-Kamchatsky", country: "Russia", timezone: "Asia/Kamchatka", lat: 53.0452, lng: 158.6512 },
  { name: "Suva", country: "Fiji", timezone: "Pacific/Fiji", lat: -18.1416, lng: 178.4419 },
  { name: "Majuro", country: "Marshall Islands", timezone: "Pacific/Majuro", lat: 7.1164, lng: 171.1858 },
  { name: "Tarawa", country: "Kiribati", timezone: "Pacific/Tarawa", lat: 1.3382, lng: 173.0176 },
  
  // === UTC+13 (Tonga, Samoa) ===
  { name: "Nuku'alofa", country: "Tonga", timezone: "Pacific/Tongatapu", lat: -21.2085, lng: -175.1982 },
  { name: "Anadyr", country: "Russia", timezone: "Asia/Anadyr", lat: 64.7337, lng: 177.4968 },
  
  // === UTC+14 (Line Islands) ===
  { name: "Kiritimati", country: "Kiribati", timezone: "Pacific/Kiritimati", lat: 1.8721, lng: -157.4278 },
];
