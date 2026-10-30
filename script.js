const API_KEY = "9244c04782b7fbd1341d767a63aef25b";
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const result = document.getElementById("result");
const searchButton = form.querySelector("button");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    getWeather();
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showMessage("Please enter a city name.", "error");
        cityInput.focus();
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching…";
    showMessage("Getting the weather for " + city + "…", "loading");

    const params = new URLSearchParams({
        q: city,
        appid: API_KEY,
        units: "metric"
    });

    try {
        const response = await fetch(
            "https://api.openweathermap.org/data/2.5/weather?" + params
        );
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("We couldn't find that city. Check the spelling and try again.");
            }
            if (response.status === 401) {
                throw new Error("The weather service API key is invalid or inactive.");
            }
            throw new Error(data.message || "The weather service is unavailable. Please try again.");
        }

        showWeather(data);
    } catch (error) {
        showMessage(
            error instanceof TypeError
                ? "Couldn't connect to the weather service. Check your internet connection and try again."
                : error.message,
            "error"
        );
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}

function showMessage(message, state) {
    const text = document.createElement("p");
    text.className = "message " + state;
    text.textContent = message;
    result.replaceChildren(text);
}

function showWeather(weather) {
    const heading = document.createElement("h2");
    heading.className = "city-name";
    heading.textContent = weather.name + ", " + weather.sys.country;

    const summary = document.createElement("div");
    summary.className = "weather-summary";

    const icon = document.createElement("img");
    icon.className = "weather-icon";
    icon.src = "https://openweathermap.org/img/wn/" +
        encodeURIComponent(weather.weather[0].icon) + "@2x.png";
    icon.alt = weather.weather[0].description;
    icon.width = 100;
    icon.height = 100;

    const temperature = document.createElement("p");
    temperature.className = "temperature";
    temperature.textContent = Math.round(weather.main.temp) + "°";

    summary.append(icon, temperature);

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = capitalize(weather.weather[0].description);

    const details = document.createElement("dl");
    details.className = "details";
    addDetail(details, "Feels like", Math.round(weather.main.feels_like) + "°C");
    addDetail(details, "Humidity", weather.main.humidity + "%");
    addDetail(details, "Wind", weather.wind.speed + " m/s");

    result.replaceChildren(heading, summary, description, details);
}

function addDetail(list, label, value) {
    const item = document.createElement("div");
    item.className = "detail";

    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = value;

    item.append(term, description);
    list.append(item);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}