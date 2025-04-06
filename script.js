const searchInput = document.querySelector('.search-input');
const currentWeatherDiv = document.querySelector('.current-weather');
const hourlyWeatherDiv = document.querySelector('.hourly-weather'); 
const locationButton = document.querySelector('.location-button');

const API_KEY = "371de8272b6e43e6ab7130622251303";

const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    heavy_rain: [1198, 1201],
    thunderstorm: [1087, 1279, 1282],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1236, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder_rain: [1273, 1276]
};

const getWeatherData = async (cityName) => {
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=3`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        document.body.classList.remove('no-show-results');

        console.log(data); 

        if (data && data.current) {
            const temperature = data.current.temp_c;
            const description = data.current.condition.text;
            const weatherCode = data.current.condition.code;

            const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(weatherCode));

            const iconFile = weatherIcon ? `${weatherIcon}.svg` : 'default.svg'; 

            currentWeatherDiv.querySelector(".weather-icon").src = `./icons/${iconFile}`;
            currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature} <span>°C</span>`;
            currentWeatherDiv.querySelector(".description").innerText = description;
        } else {
            currentWeatherDiv.querySelector(".temperature").innerHTML = "Data not found";
            currentWeatherDiv.querySelector(".weather-icon").src = "./icons/reshot-icon-weather-VAUPX2QFJK.svg";  
            currentWeatherDiv.querySelector(".description").innerText = "Please try again with a valid city.";
            
            hourlyWeatherDiv.querySelector('.weather-list').innerHTML = '';
        }

        if (data && data.forecast && data.forecast.forecastday) {
            const hourlyData = data.forecast.forecastday[0].hour; 
            
            hourlyWeatherDiv.querySelector('.weather-list').innerHTML = '';

            hourlyData.forEach(hour => {
                const time = new Date(hour.time_epoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
                const temperature = hour.temp_c;
                const weatherCode = hour.condition.code;
                const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(weatherCode));
                const iconFile = weatherIcon ? `${weatherIcon}.svg` : 'default.svg'; 

                const hourlyItem = document.createElement('li');
                hourlyItem.classList.add('weather-item');

                hourlyItem.innerHTML = `
                    <p class="time">${time}</p>
                    <img src="./icons/${iconFile}" width="5%" class="weather-icon">
                    <p class="temprature">${temperature}°C</p>
                `;

                hourlyWeatherDiv.querySelector('.weather-list').appendChild(hourlyItem);
            });
        }
    } catch (error) {
        console.log('Error fetching weather data:', error);
        currentWeatherDiv.querySelector(".temperature").innerHTML = "Error fetching data";
        currentWeatherDiv.querySelector(".weather-icon").src = "./icons/default.svg"; 
        currentWeatherDiv.querySelector(".description").innerText = "Please try again later.";
        
        hourlyWeatherDiv.querySelector('.weather-list').innerHTML = '';
        
        document.body.classList.add("show-no-results");
    }
}

const getLocationWeather = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3`;

            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data && data.location) {
                    const cityName = data.location.name;
                    searchInput.value = cityName; 
                    getWeatherData(cityName); 
                }
            } catch (error) {
                console.log('Error fetching location weather data:', error);
                alert('Unable to retrieve weather data for your location.');
            }
        }, () => {
            alert('Location access denied.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

searchInput.addEventListener("keyup", (e) => {
    const cityName = searchInput.value.trim();

    if (e.key === "Enter" && cityName !== "") {
        console.log(cityName);
        getWeatherData(cityName); 
        searchInput.value = "";
    }
});
 
locationButton.addEventListener("click", () => {
    getLocationWeather(); 
});
