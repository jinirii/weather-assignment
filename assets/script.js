
const apiKey = "acf69a844df44f8abb102319262710";
const city = "Calgary";

const cityElement = document.querySelector("#city");
const dateElement = document.querySelector("#date");
const currentWeather = document.querySelector("#current-weather");
const switchButton = document.querySelector("#switch");
const forecastContainer = document.querySelector("#forecast-container");

let isCelsius = true;
let forecastData;

async function getWeather() {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            forecastData = data;
            displayWeather();
        } else {
            console.log("Weather could not be loaded.");
        }
    } catch (error) {
        console.log("Something went wrong.");
    }
}

function displayWeather() {
    cityElement.textContent = forecastData.location.name;
    dateElement.textContent = new Date(forecastData.location.localtime).toDateString();

    let temperature;

    if (isCelsius) {
        temperature = forecastData.current.temp_c;
    } else {
        temperature = forecastData.current.temp_f;
    }

    currentWeather.innerHTML = `
        <img
            src="${getWeatherIcon(forecastData.current.condition.text)}"
            alt="${forecastData.current.condition.text}"
        >
        <h3>${temperature}°${isCelsius ? "C" : "F"}</h3>
        <p>${forecastData.current.condition.text}</p>
    `;

    displayForecast();
}

function displayForecast() {
    forecastContainer.innerHTML = "";

    for (const day of forecastData.forecast.forecastday) {
        let averageTemperature;
        let highTemperature;
        let lowTemperature;

        if (isCelsius) {
            averageTemperature = day.day.avgtemp_c;
            highTemperature = day.day.maxtemp_c;
            lowTemperature = day.day.mintemp_c;
        } else {
            averageTemperature = day.day.avgtemp_f;
            highTemperature = day.day.maxtemp_f;
            lowTemperature = day.day.mintemp_f;
        }

        const forecastCard = document.createElement("article");
        forecastCard.classList.add("forecast-card");

        forecastCard.innerHTML = `
            <h3>${day.date}</h3>
            <img
                src="${getWeatherIcon(day.day.condition.text)}"
                alt="${day.day.condition.text}"
            >
            <p>${day.day.condition.text}</p>
            <p>Average: ${averageTemperature}°${isCelsius ? "C" : "F"}</p>
            <p>High: ${highTemperature}°${isCelsius ? "C" : "F"}</p>
            <p>Low: ${lowTemperature}°${isCelsius ? "C" : "F"}</p>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}

switchButton.addEventListener("click", function() {
    isCelsius = !isCelsius;

    if (isCelsius) {
        switchButton.textContent = "Switch to °F";
    } else {
        switchButton.textContent = "Switch to °C";
    }

    if (forecastData) {
        displayWeather();
    }
});

function getWeatherIcon(condition) {
    condition = condition.toLowerCase();

    if (condition.includes("freezing rain")) {
        return "assets/icons/rain.svg";
    } else if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("showers")
    ) {
        return "assets/icons/rainy.svg";
    } else if (
        condition.includes("snow") ||
        condition.includes("sleet") ||
        condition.includes("ice")
    ) {
        return "assets/icons/snow.svg";
    } else if (
        condition.includes("cloud") ||
        condition.includes("overcast") ||
        condition.includes("mist") ||
        condition.includes("fog")
    ) {
        return "assets/icons/cloudy.svg";
    } else {
        return "assets/icons/sunny.svg";
    }
}

getWeather();
