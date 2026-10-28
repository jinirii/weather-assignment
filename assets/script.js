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

    currentWeather.textContent = "Loading weather...";
    forecastContainer.textContent = "Loading forecast...";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            forecastData = data;
            displayWeather();
        } else {
            currentWeather.textContent =
                "Weather could not be loaded. Please try again.";
            forecastContainer.textContent = "";
            console.log(data);
        }
    } catch (error) {
        currentWeather.textContent =
            "Something went wrong. Check your internet connection and try again.";
        forecastContainer.textContent = "";
        console.log(error);
    }
}

function displayWeather() {
    if (forecastData.current.is_day == 1) {
        document.body.classList.remove("night");
    } else {
        document.body.classList.add("night");
    }

    cityElement.textContent = forecastData.location.name;

    dateElement.textContent = formatDate(
        forecastData.location.localtime.split(" ")[0],
        true
    );

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
        <h3>${Math.round(temperature)}°${isCelsius ? "C" : "F"}</h3>
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
            <h3>${formatDate(day.date, false)}</h3>
            <img
                src="${getWeatherIcon(day.day.condition.text)}"
                alt="${day.day.condition.text}"
            >
            <p>${day.day.condition.text}</p>
            <p>Average: ${Math.round(averageTemperature)}°${isCelsius ? "C" : "F"}</p>
            <p>High: ${Math.round(highTemperature)}°${isCelsius ? "C" : "F"}</p>
            <p>Low: ${Math.round(lowTemperature)}°${isCelsius ? "C" : "F"}</p>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}

function formatDate(dateString, showFullDate) {
    const dateParts = dateString.split("-");
    const date = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );

    if (showFullDate) {
        return date.toLocaleDateString("en-CA", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    } else {
        return date.toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
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

    if (condition.includes("thunder")) {
        return "assets/icons/thunderstorm.svg";
    } else if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("shower")
    ) {
        return "assets/icons/rain.svg";
    } else if (
        condition.includes("snow") ||
        condition.includes("sleet") ||
        condition.includes("ice") ||
        condition.includes("blizzard") ||
        condition.includes("freezing")
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