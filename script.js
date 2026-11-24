// DOM Elements
const house = document.getElementById('house');
const body = document.body;
const card = document.getElementById('card');
const summary = document.getElementById('summary');
const dateElement = document.getElementById('date');
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const localTime = document.getElementById('local-time');
const tempElement = document.querySelector('.temp');

// API Configuration
// The key lives in js/config.js (not committed). See js/config.example.js
const API_KEY = (window.APP_CONFIG && window.APP_CONFIG.WEATHER_API_KEY) || '';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Snap SVG elements
const innerSVG = Snap('#inner');
const outerSVG = Snap('#outer');
const backSVG = Snap('#back');
const sun = Snap.select('#sun');
const sunburst = Snap.select('#sunburst');

// Cloud groups
const clouds = [
    { group: Snap.select('#cloud1'), offset: 0 },
    { group: Snap.select('#cloud2'), offset: 0 },
    { group: Snap.select('#cloud3'), offset: 0 }
];

// Weather types mapping
const weatherTypes = {
    'snow': { type: 'snow', name: 'Snow', icon: 'wi-snow' },
    'wind': { type: 'wind', name: 'Windy', icon: 'wi-strong-wind' },
    'rain': { type: 'rain', name: 'Rain', icon: 'wi-rain' },
    'thunder': { type: 'thunder', name: 'Storms', icon: 'wi-lightning' },
    'sun': { type: 'sun', name: 'Sunny', icon: 'wi-day-sunny' },
    'cloudy': { type: 'cloudy', name: 'Cloudy', icon: 'wi-cloudy' }
};

// API to local weather mapping
const weatherConditionMap = {
    'Sunny': 'sun',
    'Clear': 'sun',
    'Partly cloudy': 'sun',
    'Cloudy': 'cloudy',
    'Overcast': 'cloudy',
    'Mist': 'cloudy',
    'Fog': 'cloudy',
    'Freezing fog': 'snow',
    'Patchy rain possible': 'rain',
    'Patchy snow possible': 'snow',
    'Patchy sleet possible': 'snow',
    'Patchy freezing drizzle possible': 'rain',
    'Thundery outbreaks possible': 'thunder',
    'Blowing snow': 'snow',
    'Blizzard': 'snow',
    'Patchy light drizzle': 'rain',
    'Light drizzle': 'rain',
    'Freezing drizzle': 'rain',
    'Heavy freezing drizzle': 'rain',
    'Patchy light rain': 'rain',
    'Light rain': 'rain',
    'Moderate rain at times': 'rain',
    'Moderate rain': 'rain',
    'Heavy rain at times': 'rain',
    'Heavy rain': 'rain',
    'Light freezing rain': 'rain',
    'Moderate or heavy freezing rain': 'rain',
    'Light sleet': 'snow',
    'Moderate or heavy sleet': 'snow',
    'Patchy light snow': 'snow',
    'Light snow': 'snow',
    'Patchy moderate snow': 'snow',
    'Moderate snow': 'snow',
    'Patchy heavy snow': 'snow',
    'Heavy snow': 'snow',
    'Ice pellets': 'snow',
    'Light rain shower': 'rain',
    'Moderate or heavy rain shower': 'rain',
    'Torrential rain shower': 'rain',
    'Light sleet showers': 'snow',
    'Moderate or heavy sleet showers': 'snow',
    'Light snow showers': 'snow',
    'Moderate or heavy snow showers': 'snow',
    'Light showers of ice pellets': 'snow',
    'Moderate or heavy showers of ice pellets': 'snow',
    'Patchy light rain with thunder': 'thunder',
    'Moderate or heavy rain with thunder': 'thunder',
    'Patchy light snow with thunder': 'thunder',
    'Moderate or heavy snow with thunder': 'thunder'
};

// Settings
const settings = {
    windSpeed: 0.5,
    rainCount: 0,
    leafCount: 0,
    snowCount: 0,
    cloudHeight: 100,
    cloudSpace: 30,
    cloudArch: 50
};

let currentWeather = weatherTypes['snow'];
let particles = [];
let animationFrame;
let currentLocation = 'New York';
let weatherRequestId = 0;

// Canvas setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize
function init() {
    setupDate();
    setupWeatherButtons();
    drawClouds();
    changeWeather(weatherTypes['snow']);
    updateBackgroundByTime();
    animate();
    
    // Setup search functionality
    setupSearch();
    
    // Get initial weather for default location
    fetchWeather(currentLocation);
    
    // Update background every minute
    setInterval(updateBackgroundByTime, 60000);
}

// Setup search functionality
function setupSearch() {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });
}

// Fetch weather data
async function fetchWeather(location) {
    const requestId = ++weatherRequestId;

    if (!API_KEY) {
        alert('Missing API key. Copy js/config.example.js to js/config.js and add your WeatherAPI key.');
        return;
    }

    try {
        searchBtn.innerHTML = '<i class="wi wi-cloud-refresh"></i>';
        searchBtn.disabled = true;
        
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}`
        );
        
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        const data = await response.json();
        if (requestId !== weatherRequestId) return;
        
        // Update UI with location data
        updateLocationInfo(data);
        
        // Update weather based on condition
        updateWeatherFromAPI(data.current);
        
    } catch (error) {
        if (requestId === weatherRequestId) {
            console.error('Error fetching weather:', error);
            alert('Error: Could not find weather for this location. Please try again.');
            cityInput.value = currentLocation;
        }
    } finally {
        if (requestId === weatherRequestId) {
            searchBtn.innerHTML = '<i class="wi wi-cloudy"></i>';
            searchBtn.disabled = false;
        }
    }
}

// Update location information
function updateLocationInfo(data) {
    const { location, current } = data;
    currentLocation = location.name;
    
    // Update city name
    cityName.textContent = `${location.name}, ${location.country}`;
    
    // Update local time
    const localDateTime = new Date(location.localtime);
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    };
    localTime.textContent = localDateTime.toLocaleTimeString('en-US', timeOptions);
    
    // Update date
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    dateElement.textContent = localDateTime.toLocaleDateString('en-US', dateOptions);
    
    // Update temperature
    const tempC = Math.round(current.temp_c);
    const tempF = Math.round(current.temp_f);
    tempElement.innerHTML = `${tempC}<span>°c</span>`;
    
    // Update time-based background
    updateBackgroundByLocalTime(localDateTime);
}

// Update weather from API data
function updateWeatherFromAPI(current) {
    const conditionText = current.condition.text;
    console.log('API Condition:', conditionText);
    
    // Convert to lowercase for easier matching
    const conditionLower = conditionText.toLowerCase();
    
    let weatherType = 'sun'; // Default
    
    // Check for keywords in the condition text
    if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
        weatherType = 'thunder';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        weatherType = 'rain';
    } else if (conditionLower.includes('snow') || conditionLower.includes('sleet') || conditionLower.includes('blizzard') || conditionLower.includes('ice')) {
        weatherType = 'snow';
    } else if (conditionLower.includes('wind') || conditionLower.includes('gust')) {
        weatherType = 'wind';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('fog') || conditionLower.includes('mist')) {
        weatherType = 'cloudy';
    } else {
        // Try the mapping object as fallback
        weatherType = weatherConditionMap[conditionText] || 'sun';
    }
    
    console.log('Mapped to:', weatherType);
    
    // Update weather summary
    summary.textContent = current.condition.text;
    
    // Change to appropriate weather
    if (weatherTypes[weatherType]) {
        changeWeather(weatherTypes[weatherType]);
    } else {
        console.log('Weather type not found:', weatherType);
        changeWeather(weatherTypes['sun']); // Fallback
    }
}

// Update background based on local time
function updateBackgroundByLocalTime(dateTime) {
    const hour = dateTime.getHours();
    
    // Remove all time-based classes
    body.classList.remove('day', 'night');
    
    // Add appropriate class based on time
    if (hour >= 6 && hour < 18) {
        body.classList.add('day');
        // Show sun and move to daytime position
        sun.node.style.display = 'block';
        sunburst.node.style.display = 'block';
        TweenMax.to(sun.node, 2, { x: 150, y: 200, ease: Power2.easeInOut });
        TweenMax.to(sunburst.node, 2, { scale: 1, opacity: 0.3, ease: Power2.easeInOut });
    } else {
        body.classList.add('night');
        // Show moon (sun with different appearance) at night
        sun.node.style.display = 'block';
        sunburst.node.style.display = 'block';
        TweenMax.to(sun.node, 2, { x: 150, y: -100 });
        TweenMax.to(sunburst.node, 2, { scale: 0.4, opacity: 0 });
    }
}

// Setup current date

function setupDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Setup weather buttons
function setupWeatherButtons() {
    Object.values(weatherTypes).forEach(w => {
        const button = document.getElementById(`button-${w.type}`);
        if (button) {
            w.button = button; 
            button.addEventListener('click', () => changeWeather(w));
        }
    });
}

// Draw clouds
function drawClouds() {
    const cardWidth = 300;
    
    clouds.forEach((cloud, i) => {
        const space = settings.cloudSpace * i;
        const height = space + settings.cloudHeight;
        const arch = height + settings.cloudArch + (Math.random() * settings.cloudArch);
        const width = cardWidth;
        
        const points = [];
        points.push(`M${-width},0`);
        points.push(`${width},0`);
        points.push(`Q${width * 2},${height / 2}`);
        points.push(`${width},${height}`);
        points.push(`Q${width * 0.5},${arch}`);
        points.push(`0,${height}`);
        points.push(`Q${width * -0.5},${arch}`);
        points.push(`${-width},${height}`);
        points.push(`Q${-(width * 2)},${height / 2}`);
        points.push(`${-width},0`);
        
        const path = points.join(' ');
        if (!cloud.path) {
            cloud.path = cloud.group.path();
        }
        cloud.path.attr({ d: path });
        cloud.offset = Math.random() * cardWidth;
    });
}

// Update background based on local time
function updateBackgroundByTime() {
    const now = new Date();
    updateBackgroundByLocalTime(now);
}

// Change weather
function changeWeather(w) {
    currentWeather = w;
    if (w.type !== 'thunder' && lightningInterval) {
        clearInterval(lightningInterval);
        lightningInterval = undefined;
    }
    
    // Update active button
    Object.values(weatherTypes).forEach(weather => {
        if (weather.button) {
            weather.button.classList.remove('active');
            weather.button.setAttribute('aria-pressed', 'false');
        }
    });
    if (w.button) {
        w.button.classList.add('active');
        w.button.setAttribute('aria-pressed', 'true');
    }
    
    // Update summary if not from API
    if (w.name !== summary.textContent && !summary.textContent.includes('°')) {
        summary.textContent = w.name;
    }
    
    // Clear particles
    particles = [];
    
    // Remove all weather classes
    body.classList.remove('sunny', 'rainy', 'stormy', 'cloudy-day');
    
    // Update settings based on weather type
    switch (w.type) {
        case 'snow':
            TweenMax.to(settings, 2, { windSpeed: 0.5, rainCount: 0, leafCount: 0, snowCount: 50 });
            break;
            
        case 'wind':
            TweenMax.to(settings, 2, { windSpeed: 3, rainCount: 0, leafCount: 10, snowCount: 0 });
            break;
            
        case 'rain':
            body.classList.add('rainy');
            TweenMax.to(settings, 2, { windSpeed: 0.5, rainCount: 30, leafCount: 0, snowCount: 0 });
            break;
            
        case 'thunder':
            body.classList.add('stormy');
            TweenMax.to(settings, 2, { windSpeed: 0.5, rainCount: 60, leafCount: 0, snowCount: 0 });
            startLightning();
            break;
            
        case 'sun':
            body.classList.add('sunny');
            TweenMax.to(settings, 2, { windSpeed: 20, rainCount: 0, leafCount: 0, snowCount: 0 });
            break;

        case 'cloudy':
            body.classList.add('cloudy-day');
            TweenMax.to(settings, 2, { windSpeed: 20, rainCount: 0, leafCount: 0, snowCount: 0 });
            break;
    }
}

// Lightning effect
let lightningInterval;
function startLightning() {
    if (lightningInterval) clearInterval(lightningInterval);
    
    if (currentWeather.type === 'thunder') {
        lightningInterval = setInterval(() => {
            if (currentWeather.type === 'thunder') {
                createLightning();
            }
        }, 3000 + Math.random() * 3000);
    }
}

function createLightning() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.8)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '100';
    document.body.appendChild(flash);
    
    TweenMax.to(flash, 0.1, {
        opacity: 0,
        onComplete: () => {
            document.body.removeChild(flash);
        }
    });
}

// Particle system
class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = 2 + Math.random() * 3;
        this.size = 2 + Math.random() * 3;
        
        switch (this.type) {
            case 'rain':
                this.speed = 10 + Math.random() * 4;
                this.size = 1 + Math.random() * 2;
                this.length = 10 + Math.random() * 10;
                break;
                
            case 'snow':
                this.speed = 5 + Math.random() * 2;
                this.size = 3 + Math.random() * 4;
                this.drift = Math.random() * 2 - 1;
                break;
                
            case 'leaf':
                this.speed = 2 + Math.random() * 2;
                this.size = 4 + Math.random() * 4;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 4 - 2;
                this.drift = Math.random() * 3 - 1.5;
                this.color = ['#76993E', '#4A5E23', '#6D632F'][Math.floor(Math.random() * 3)];
                break;
        }
    }
    
    update() {
        this.y += this.speed;
        
        if (this.type === 'snow' || this.type === 'leaf') {
            this.x += this.drift;
        }
        
        if (this.type === 'leaf') {
            this.rotation += this.rotationSpeed;
        }
        
        if (this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        
        switch (this.type) {
            case 'rain':
                ctx.strokeStyle = currentWeather.type === 'thunder'
                    ? 'rgba(210, 220, 240, 0.65)'
                    : 'rgba(46, 114, 180, 0.55)';
                ctx.lineWidth = this.size;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + this.length);
                ctx.stroke();
                break;
                
            case 'snow':
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'leaf':
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update cloud positions
    clouds.forEach((cloud, i) => {
        if (currentWeather.type === 'sun') {
            if (cloud.offset > -450) {
                cloud.offset += settings.windSpeed / (i + 1);
            }
            if (cloud.offset > 750) {
                cloud.offset = -450;
            }
        } else {
            cloud.offset += settings.windSpeed / (i + 1);
            if (cloud.offset > 300) {
                cloud.offset = 0 + (cloud.offset - 300);
            }
        }
        cloud.group.transform(`t${cloud.offset},0`);
    });
    
    // Manage particles
    const targetCounts = {
        rain: settings.rainCount,
        snow: settings.snowCount,
        leaf: settings.leafCount
    };
    
    // Add particles if needed
    Object.keys(targetCounts).forEach(type => {
        const currentCount = particles.filter(p => p.type === type).length;
        const targetCount = targetCounts[type];
        
        if (currentCount < targetCount) {
            for (let i = 0; i < targetCount - currentCount; i++) {
                particles.push(new Particle(type));
            }
        }
    });
    
    // Remove excess particles
    particles = particles.filter(p => {
        const targetCount = targetCounts[p.type];
        const currentCount = particles.filter(particle => particle.type === p.type).length;
        return currentCount <= targetCount;
    });
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    animationFrame = requestAnimationFrame(animate);
}

// Mouse interaction for house rotation
let mouseX = 0;
let mouseY = 0;

document.addEventListener('pointermove', (e) => {
    mouseX = e.pageX / window.innerWidth - 0.5;
    mouseY = e.pageY / window.innerHeight - 0.5;
    
    house.style.transform = `
        perspective(20000px)
        rotateX(${mouseY * 20 + 75}deg)
        rotateZ(${-mouseX * 20 + 35}deg)
        translateZ(-9vw)
    `;
});

// Start the application
init();