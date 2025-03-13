// Global variables
let quotesData = [];
let weatherData = {};
let moodData = [];
let gratitudeData = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    initNavigation();

    // Load data
    loadQuotes();

    // Initialize features
    initMotivation();
    initWeatherMood();
    initMoodTracker();
    initGratitudeJournal();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all links and sections
            navLinks.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Show corresponding section
            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Daily Motivation Feature
function initMotivation() {
    const newQuoteBtn = document.getElementById('new-quote-btn');

    // Show random quote on load
    showRandomQuote();

    // Show new quote on button click
    newQuoteBtn.addEventListener('click', showRandomQuote);
}

function loadQuotes() {
    fetch('data/quotes.json')
        .then(response => response.json())
        .then(data => {
            quotesData = data;
            showRandomQuote();
        })
        .catch(error => {
            console.error('Error loading quotes:', error);
            document.getElementById('daily-quote').textContent = "Could not load quotes. Please try again later.";
        });
}

function showRandomQuote() {
    if (quotesData.length === 0) return;

    const randomIndex = Math.floor(Math.random() * quotesData.length);
    const quote = quotesData[randomIndex];

    document.getElementById('daily-quote').textContent = quote.text;
    document.getElementById('quote-author').textContent = `- ${quote.author}`;
}

// Weather Mood Feature
function initWeatherMood() {
    // Get weather data based on user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeather(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error("Error getting location", error);
                document.getElementById('current-location').textContent = "Location access denied";
                document.getElementById('mood-suggestion').textContent = "Please enable location services for personalized suggestions.";
            }
        );
    } else {
        document.getElementById('current-location').textContent = "Geolocation is not supported by this browser";
    }

    // Load weather mood suggestions
    loadWeatherMoodData();
}

function getWeather(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
            fetchWeatherData(city, lat, lon);
        })
        .catch(error => {
            console.error("Error retrieving city name:", error);
            fetchWeatherData("Your Location", lat, lon);
        });
}

function fetchWeatherData(city, lat, lon) {
    // Replace with a real weather API call (e.g., OpenWeatherMap)
    const demoWeatherTypes = ["sunny", "rainy", "cloudy", "snowy", "partly cloudy"];
    const randomWeather = demoWeatherTypes[Math.floor(Math.random() * demoWeatherTypes.length)];
    const randomTemp = Math.floor(Math.random() * 30) + 5; // Random temperature between 5-35°C

    updateWeatherUI(city, randomWeather, randomTemp);
}

function loadWeatherMoodData() {
    fetch('data/weather_moods.json')
        .then(response => response.json())
        .then(data => {
            weatherData = data;
            updateWeatherSuggestions();
        })
        .catch(error => {
            console.error('Error loading weather moods:', error);
        });
}

function updateWeatherUI(location, weather, temperature) {
    document.getElementById('current-location').textContent = location;
    document.getElementById('current-weather').textContent = capitalizeFirstLetter(weather);
    document.getElementById('current-temp').textContent = `${temperature}°C`;

    // Set weather icon
    const weatherIcon = document.getElementById('weather-icon');
    switch (weather) {
        case 'sunny':
            weatherIcon.innerHTML = '<i class="fas fa-sun" style="color: #FFC107;"></i>';
            break;
        case 'rainy':
            weatherIcon.innerHTML = '<i class="fas fa-cloud-rain" style="color: #4A8FE7;"></i>';
            break;
        case 'cloudy':
            weatherIcon.innerHTML = '<i class="fas fa-cloud" style="color: #ADB5BD;"></i>';
            break;
        case 'snowy':
            weatherIcon.innerHTML = '<i class="fas fa-snowflake" style="color: #DEE2E6;"></i>';
            break;
        case 'partly cloudy':
            weatherIcon.innerHTML = '<i class="fas fa-cloud-sun" style="color: #6C757D;"></i>';
            break;
        default:
            weatherIcon.innerHTML = '<i class="fas fa-sun" style="color: #FFC107;"></i>';
    }

    // Update mood suggestions based on weather
    updateWeatherSuggestions(weather);
}

function updateWeatherSuggestions(currentWeather = 'sunny') {
    if (Object.keys(weatherData).length === 0) return;

    // Find matching weather mood suggestions
    const weatherMood = weatherData.find(item => item.weather.toLowerCase() === currentWeather.toLowerCase());

    if (weatherMood) {
        document.getElementById('mood-suggestion').textContent = weatherMood.mood;

        // Update activities list
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';

        weatherMood.activities.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity;
            activitiesList.appendChild(li);
        });
    }
}

// Mood Tracker Feature
function initMoodTracker() {
    // Load saved mood data
    loadMoodData();

    // Handle mood selection
    const moodOptions = document.querySelectorAll('.mood-option');
    let selectedMood = null;

    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Store selected mood
            selectedMood = option.getAttribute('data-mood');
        });
    });

    // Handle mood saving
    const saveMoodBtn = document.getElementById('save-mood');
    saveMoodBtn.addEventListener('click', () => {
        if (!selectedMood) {
            alert('Please select a mood first');
            return;
        }

        const note = document.getElementById('mood-note').value;
        const today = new Date();

        // Check if mood for today already exists
        const existingIndex = moodData.findIndex(item => {
            const itemDate = new Date(item.date);
            return itemDate.toDateString() === today.toDateString();
        });

        if (existingIndex !== -1) {
            // Update existing mood
            moodData[existingIndex] = {
                date: today.toISOString(),
                mood: selectedMood,
                note: note
            };
        } else {
            // Add new mood
            moodData.push({
                date: today.toISOString(),
                mood: selectedMood,
                note: note
            });
        }

        // Save to local storage
        saveMoodData();

        // Update visualization
        updateMoodHeatmap();

        // Reset form
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        document.getElementById('mood-note').value = '';
        selectedMood = null;

        alert('Mood saved successfully!');
    });

    // Initialize mood heatmap
    updateMoodHeatmap();
}

function loadMoodData() {
    const savedMoodData = localStorage.getItem('brightDaysMoodData');
    if (savedMoodData) {
        moodData = JSON.parse(savedMoodData);
    }
}

function saveMoodData() {
    localStorage.setItem('brightDaysMoodData', JSON.stringify(moodData));
}

function updateMoodHeatmap() {
    const heatmapContainer = document.getElementById('mood-heatmap');
    heatmapContainer.innerHTML = '';

    // Get the current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Calculate the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('mood-day');
        emptyCell.style.backgroundColor = '#f0f0f0';
        emptyCell.style.opacity = '0.3';
        heatmapContainer.appendChild(emptyCell);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= lastDay; i++) {
        const dayDate = new Date(currentYear, currentMonth, i);
        const dayCell = document.createElement('div');
        dayCell.classList.add('mood-day');

        // Find mood data for this day if it exists
        const dayMood = moodData.find(item => {
            const itemDate = new Date(item.date);
            return itemDate.toDateString() === dayDate.toDateString();
        });

        // Set background color based on mood
        if (dayMood) {
            switch (dayMood.mood) {
                case 'great':
                    dayCell.style.backgroundColor = '#4CAF50';
                    break;
                case 'good':
                    dayCell.style.backgroundColor = '#8BC34A';
                    break;
                case 'okay':
                    dayCell.style.backgroundColor = '#FFC107';
                    break;
                case 'down':
                    dayCell.style.backgroundColor = '#FF9800';
                    break;
                case 'awful':
                    dayCell.style.backgroundColor = '#F44336';
                    break;
            }

            // Add tooltip with note if available
            if (dayMood.note) {
                dayCell.title = dayMood.note;
            }
        } else {
            dayCell.style.backgroundColor = '#E0E0E0';
        }

        // Add day number
        const dayInner = document.createElement('div');
        dayInner.classList.add('mood-day-inner');
        dayInner.textContent = i;
        dayCell.appendChild(dayInner);

        // Highlight today
        if (i === today.getDate()) {
            dayCell.style.border = '2px solid #4a8fe7';
        }

        heatmapContainer.appendChild(dayCell);
    }
}

// Gratitude Journal Feature
function initGratitudeJournal() {
    // Load saved gratitude entries
    loadGratitudeData();

    // Handle saving new gratitude entry
    const saveGratitudeBtn = document.getElementById('save-gratitude');
    saveGratitudeBtn.addEventListener('click', () => {
        const entry = document.getElementById('gratitude-entry').value.trim();

        if (!entry) {
            alert('Please write something you are grateful for');
            return;
        }

        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            content: entry
        };

        // Add to data
        gratitudeData.unshift(newEntry);

        // Save to local storage
        saveGratitudeData();

        // Update UI
        renderGratitudeEntries();

        // Clear form
        document.getElementById('gratitude-entry').value = '';

        alert('Gratitude entry saved!');
    });

    // Initial render of gratitude entries
    renderGratitudeEntries();
}

function loadGratitudeData() {
    const savedGratitudeData = localStorage.getItem('brightDaysGratitudeData');
    if (savedGratitudeData) {
        gratitudeData = JSON.parse(savedGratitudeData);
    }
}

function saveGratitudeData() {
    localStorage.setItem('brightDaysGratitudeData', JSON.stringify(gratitudeData));
}

function renderGratitudeEntries() {
    const entriesContainer = document.getElementById('gratitude-entries');
    entriesContainer.innerHTML = '';

    if (gratitudeData.length === 0) {
        entriesContainer.innerHTML = '<p>No entries yet. Start your gratitude journey today!</p>';
        return;
    }

    gratitudeData.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.classList.add('gratitude-entry-card');

        // Format date
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        entryCard.innerHTML = `
            <div class="entry-date">${formattedDate}</div>
            <div class="entry-content">${entry.content}</div>
            <div class="entry-actions">
                <button class="delete-entry" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;

        entriesContainer.appendChild(entryCard);

        // Add event listener for delete button
        const deleteBtn = entryCard.querySelector('.delete-entry');
        deleteBtn.addEventListener('click', () => {
            deleteGratitudeEntry(entry.id);
        });
    });
}

function deleteGratitudeEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        // Remove entry from data
        gratitudeData = gratitudeData.filter(entry => entry.id !== id);

        // Save to local storage
        saveGratitudeData();

        // Update UI
        renderGratitudeEntries();
    }
}

// Helper Functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}