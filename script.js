const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');

// Sprawdzenie ostatniego miasta przy starcie
const lastCity = localStorage.getItem('lastCity');
if (lastCity) {
    cityInput.value = lastCity;
    getWeatherData(lastCity);
}

async function getWeatherData(cityNameOverride = null) {
    const cityName = cityNameOverride || cityInput.value.trim();
    if (!cityName) {
        alert('Wpisz nazwę miasta!');
        return;
    }

    if (/^\d+$/.test(cityName)) {
        alert('Nieprawidłowa nazwa miasta! Nie używaj cyfr.');
        return;
    }

    weatherResult.innerHTML = 'Ładowanie danych...';

    try {
        //  Pobieranie współrzędnych
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=pl&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = '❌ Nie znaleziono takiego miasta.';
            document.body.className = ''; // Reset tła
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        //  Pobieranie aktualnej pogody (w tym kod pogody i temperatura)
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        const temperature = weatherData.current_weather.temperature;
        const windspeed = weatherData.current_weather.windspeed;
        const weatherCode = weatherData.current_weather.weathercode;

        //  Logika zmiany tła i ikon na podstawie temperatury i kodu pogody
        let bgClass = 'sunny';
        let tempEmoji = '☀️';
        let weatherDescription = 'Słonecznie / Pogodnie';

        
        if (weatherCode >= 51 && weatherCode <= 67) {
            bgClass = 'rainy';
            tempEmoji = '🌧️';
            weatherDescription = 'Deszczowo';
        } else if (weatherCode >= 71 && weatherCode <= 77) {
            bgClass = 'cold';
            tempEmoji = '❄️';
            weatherDescription = 'Śnieg / Mróz';
        } else if (temperature < 5) {
            bgClass = 'cold';
            tempEmoji = '🥶';
            weatherDescription = 'Chłodno';
        } else if (temperature > 20) {
            bgClass = 'sunny';
            tempEmoji = '🔥';
            weatherDescription = 'Ciepło / Słonecznie';
        } else {
            bgClass = 'rainy';
            tempEmoji = '⛅';
            weatherDescription = 'Pochmurno / Umiarkowanie';
        }

        // Przypisanie klasy do <body> (zmienia tło całego ekranu)
        document.body.className = bgClass;

        //  Wyświetlanie wyników
        weatherResult.innerHTML = `
            <h3>${name}, ${country}</h3>
            <p>${tempEmoji} Stan: <strong>${weatherDescription}</strong></p>
            <p>🌡️ Temperatura: <strong>${temperature}°C</strong></p>
            <p>💨 Prędkość wiatru: <strong>${windspeed} km/h</strong></p>
        `;

        // Zapis w pamięci
        localStorage.setItem('lastCity', name);

    } catch (error) {
        weatherResult.innerHTML = '⚠️ Wystąpił błąd podczas pobierania danych.';
        console.error(error);
        document.body.className = '';
    }
}

// Nasłuchiwanie zdarzeń
searchBtn.addEventListener('click', () => getWeatherData());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherData();
    }
});