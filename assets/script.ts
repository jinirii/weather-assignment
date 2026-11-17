
export {};

// added interfaces to define the weather api data
interface WeatherCondition {
    text: string;
}

interface WeatherLocation {
    name: string;
    localtime: string;
}

interface CurrentWeather {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: WeatherCondition;
}

interface ForecastDay {
    date: string;
    day: {
        avgtemp_c: number;
        avgtemp_f: number;
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        condition: WeatherCondition;
    };
}

interface WeatherApiResponse {
    location: WeatherLocation;
    current: CurrentWeather;
    forecast: {
        forecastday: ForecastDay[];
    };
}

// API
// .env file created to store the api
const apiKey = "acf69a844df44f8abb102319262710";
const city = "Calgary";

// added types to html elements
const cityElement = document.querySelector<HTMLElement>("#city");
const dateElement = document.querySelector<HTMLElement>("#date");
const currentWeather = document.querySelector<HTMLElement>("#current-weather");
const switchButton = document.querySelector<HTMLButtonElement>("#switch");
const forecastContainer = document.querySelector<HTMLElement>("#forecast-container");
const forecastTitle = document.querySelector<HTMLElement>(".forecast h2");

// check if the required html elements exist
if (
    cityElement === null ||
    dateElement === null ||
    currentWeather === null ||
    switchButton === null ||
    forecastContainer === null ||
    forecastTitle === null
) {
    throw new Error("Required HTML elements could not be found.");
}

// Application
let isCelsius = true;
let forecastData: WeatherApiResponse | null = null;

// organized weather icon rules into a lookup array
const weatherIconRules: { keywords: string[]; icon: string }[] = [
    {
        keywords: ["thunder"],
        icon: "assets/icons/thunderstorm.svg"
    },
    {
        keywords: ["rain", "drizzle", "shower"],
        icon: "assets/icons/rain.svg"
    },
    {
        keywords: ["snow", "sleet", "ice", "blizzard", "freezing"],
        icon: "assets/icons/snow.svg"
    },
    {
        keywords: ["cloud", "overcast", "mist", "fog"],
        icon: "assets/icons/cloudy.svg"
    }
];

async function getWeather(): Promise<void> {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`;

    currentWeather!.textContent = "Loading weather...";
    forecastContainer!.textContent = "Loading forecast...";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather request failed: ${response.status}`);
        }

        // typed the api response before using it
        const data: WeatherApiResponse = await response.json();

        forecastData = data;
        displayWeather();

    // better error handling for API errors
    } catch (error: unknown) {
        currentWeather!.textContent =
            "Weather could not be loaded. Please try again.";

        forecastContainer!.textContent = "";

        // api errors easier to find and fix
        console.error("Error retrieving weather:", error);
    }
}

function displayWeather(): void {
    if (forecastData === null) {
        return;
    }

    // theme change based on day or night
    if (forecastData.current.is_day === 1) {
        document.body.classList.remove("night");
    } else {
        document.body.classList.add("night");
    }

    cityElement!.textContent = forecastData.location.name;

    const localDate = forecastData.location.localtime.split(" ")[0];
    dateElement!.textContent = formatDate(localDate, true);

    const temperature = isCelsius
        ? forecastData.current.temp_c
        : forecastData.current.temp_f;

    const weatherIcon = document.createElement("img");
    weatherIcon.src = getWeatherIcon(forecastData.current.condition.text);
    weatherIcon.alt = forecastData.current.condition.text;

    const temperatureElement = document.createElement("h3");
    temperatureElement.textContent =
        `${Math.round(temperature)}°${isCelsius ? "C" : "F"}`;

    const conditionElement = document.createElement("p");
    conditionElement.textContent = forecastData.current.condition.text;

    currentWeather!.replaceChildren(
        weatherIcon,
        temperatureElement,
        conditionElement
    );

    displayForecast();
}

function displayForecast(): void {
    if (forecastData === null) {
        return;
    }

    forecastContainer!.replaceChildren();

    const forecastDays = forecastData.forecast.forecastday;

    // show the actual number of forecast days
    forecastTitle!.textContent = `${forecastDays.length}-Day Forecast`;

    for (const day of forecastDays) {
        const averageTemperature = isCelsius
            ? day.day.avgtemp_c
            : day.day.avgtemp_f;

        const highTemperature = isCelsius
            ? day.day.maxtemp_c
            : day.day.maxtemp_f;

        const lowTemperature = isCelsius
            ? day.day.mintemp_c
            : day.day.mintemp_f;

        const forecastCard = document.createElement("article");
        forecastCard.classList.add("forecast-card");

        const dayHeading = document.createElement("h3");
        dayHeading.textContent = formatDate(day.date, false);

        const weatherIcon = document.createElement("img");
        weatherIcon.src = getWeatherIcon(day.day.condition.text);
        weatherIcon.alt = day.day.condition.text;

        const conditionElement = document.createElement("p");
        conditionElement.textContent = day.day.condition.text;

        const averageElement = document.createElement("p");
        averageElement.textContent =
            `Average: ${Math.round(averageTemperature)}°${isCelsius ? "C" : "F"}`;

        const highElement = document.createElement("p");
        highElement.textContent =
            `High: ${Math.round(highTemperature)}°${isCelsius ? "C" : "F"}`;

        const lowElement = document.createElement("p");
        lowElement.textContent =
            `Low: ${Math.round(lowTemperature)}°${isCelsius ? "C" : "F"}`;

        forecastCard.append(
            dayHeading,
            weatherIcon,
            conditionElement,
            averageElement,
            highElement,
            lowElement
        );

        forecastContainer!.appendChild(forecastCard);
    }
}

// format the date to be more readable
function formatDate(
    dateString: string,
    showFullDate: boolean
): string {
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
    }

    return date.toLocaleDateString("en-CA", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

function getWeatherIcon(condition: string): string {
    const lowerCondition = condition.toLowerCase();

    // use find and some to match weather conditions with icons
    const matchingRule = weatherIconRules.find((rule) =>
        rule.keywords.some((keyword) =>
            lowerCondition.includes(keyword)
        )
    );

    if (matchingRule) {
        return matchingRule.icon;
    }

    return "assets/icons/sunny.svg";
}

switchButton!.addEventListener("click", (): void => {
    isCelsius = !isCelsius;

    switchButton!.textContent = isCelsius
        ? "Switch to °F"
        : "Switch to °C";

    if (forecastData !== null) {
        displayWeather();
    }
});

getWeather();
