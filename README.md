# 🏠 WeatherHouse 3D

An interactive 3D house, built entirely with CSS transforms, that reacts to the weather. Search any city and watch snow, rain, thunderstorms, wind or sunshine play out around the house, with the sky shifting between day and night based on the city's local time.

<!-- Add a screenshot or GIF: save it to assets/screenshots/demo.png and uncomment the line below -->
<!-- ![WeatherHouse 3D preview](assets/screenshots/demo.png) -->

**Live demo:** _add your GitHub Pages link here_

## Features

- **Live weather search**: type a city or country and get its current temperature, condition and local time (via WeatherAPI).
- **Weather effects**: animated snow, rain, thunderstorms (with lightning flashes), wind with blowing leaves, sunshine and cloudy skies.
- **Day / night mode**: the background and sun/moon position follow the searched city's local time.
- **3D house you can steer**: move your mouse to rotate the house in real time. It's pure CSS 3D, with no WebGL needed.
- **Manual controls**: switch effects yourself with the icon bar to preview each weather type.
- **Responsive layout** for desktop and mobile screens.

## Tech stack

| Purpose | Tool |
|---|---|
| Structure, styling, 3D house | HTML5, CSS3 (3D transforms) |
| Logic and particle effects | Vanilla JavaScript, Canvas API |
| Cloud / sun animation | [Snap.svg](http://snapsvg.io/), [GSAP TweenMax](https://greensock.com/) |
| Icons | [Weather Icons](https://erikflowers.github.io/weather-icons/) |
| Weather data | [WeatherAPI](https://www.weatherapi.com/) |

## Getting started

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR-USERNAME/weatherhouse-3d.git
   cd weatherhouse-3d
   ```
2. **Add your API key**: get a free key at [weatherapi.com](https://www.weatherapi.com/), then:
   ```bash
   cp js/config.example.js js/config.js
   ```
   Open `js/config.js` and replace `YOUR_WEATHERAPI_KEY_HERE` with your key. This file is git-ignored, so your key stays out of the repo.
3. **Run it**: open `index.html` in your browser, or serve it locally:
   ```bash
   python -m http.server 8000
   ```
   then visit `http://localhost:8000`.

> **Note:** because this is a front-end-only app, the key is visible in the browser's network tab once the site is running. Use a free-tier key and don't reuse one from a paid account.

## Project structure

```
weatherhouse-3d/
├── index.html            # page markup and 3D house elements
├── css/
│   └── style.css         # house geometry, weather card, themes
├── js/
│   ├── script.js         # weather API, particles, animation, interaction
│   └── config.example.js # template for your API key (copy to config.js)
├── assets/
│   └── screenshots/      # preview images for this README
├── LICENSE
└── README.md
```

## How it works

1. The search box calls WeatherAPI's `current.json` endpoint for the chosen location.
2. The condition text (e.g. "Light rain with thunder") is matched to one of six effects: snow, wind, rain, thunder, sun or cloudy.
3. Particle counts, wind speed and cloud motion are tweened with GSAP, and a canvas layer draws the rain, snow and leaves.
4. The city's local hour decides day or night styling.
5. Pointer movement rotates the CSS 3D house.

## Roadmap

- [ ] Forecast for the next few days
- [ ] °C / °F toggle
- [ ] Geolocation ("use my location")
- [ ] Moon and stars at night

## Credits

- 3D CSS house concept inspired by community CSS 3D experiments.
- Weather data by [WeatherAPI.com](https://www.weatherapi.com/).

## License

Released under the [MIT License](LICENSE).
