// Global variables
let quotesData = [];
let weatherData = {};
let moodData = [];
let gratitudeData = [];
let currentQuote = null;

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
    const favoriteBtn = document.getElementById('favorite-quote-btn');
    const shareBtn = document.getElementById('share-quote-btn');

    // Load favorite quotes from local storage
    let favoriteQuotes = JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');

    // Show random quote on load
    showRandomQuote();

    // Show new quote on button click
    newQuoteBtn.addEventListener('click', showRandomQuote);

    // Handle favoriting quotes
    favoriteBtn.addEventListener('click', toggleFavoriteQuote);

    // Handle sharing quotes
    shareBtn.addEventListener('click', shareQuote);

    // Show favorites tab functionality
    const favoritesTabBtn = document.getElementById('favorites-tab');
    const randomTabBtn = document.getElementById('random-tab');
    const motivationTabs = document.querySelectorAll('.motivation-tab');
    const quoteSections = document.querySelectorAll('.quote-section');

    favoritesTabBtn.addEventListener('click', () => {
        motivationTabs.forEach(tab => tab.classList.remove('active'));
        favoritesTabBtn.classList.add('active');

        quoteSections.forEach(section => section.classList.remove('active'));
        document.getElementById('favorites-section').classList.add('active');

        renderFavoriteQuotes();
    });

    randomTabBtn.addEventListener('click', () => {
        motivationTabs.forEach(tab => tab.classList.remove('active'));
        randomTabBtn.classList.add('active');

        quoteSections.forEach(section => section.classList.remove('active'));
        document.getElementById('random-section').classList.add('active');
    });
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
    currentQuote = quotesData[randomIndex];

    document.getElementById('daily-quote').textContent = currentQuote.text;
    document.getElementById('quote-author').textContent = `- ${currentQuote.author}`;

    // Update favorite button state
    updateFavoriteButtonState();

    // Apply a fade-in animation
    const quoteCard = document.querySelector('.quote-card');
    quoteCard.classList.add('fade-in');
    setTimeout(() => {
        quoteCard.classList.remove('fade-in');
    }, 1000);

    // Set current quote category if available
    if (currentQuote.category) {
        document.getElementById('quote-category').textContent = currentQuote.category;
        document.getElementById('quote-category').style.display = 'inline-block';
    } else {
        document.getElementById('quote-category').style.display = 'none';
    }
}

function toggleFavoriteQuote() {
    if (!currentQuote) return;

    let favoriteQuotes = JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');

    // Check if current quote is already favorited
    const existingIndex = favoriteQuotes.findIndex(q => q.text === currentQuote.text && q.author === currentQuote.author);

    if (existingIndex !== -1) {
        // Remove from favorites
        favoriteQuotes.splice(existingIndex, 1);
    } else {
        // Add to favorites
        favoriteQuotes.push(currentQuote);
    }

    // Save to local storage
    localStorage.setItem('brightDaysFavoriteQuotes', JSON.stringify(favoriteQuotes));

    // Update button state
    updateFavoriteButtonState();

    // Show brief notification
    showNotification(existingIndex !== -1 ? 'Removed from favorites' : 'Added to favorites');
}

function updateFavoriteButtonState() {
    const favoriteBtn = document.getElementById('favorite-quote-btn');
    let favoriteQuotes = JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');

    if (!currentQuote) {
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        return;
    }

    // Check if current quote is in favorites
    const isFavorite = favoriteQuotes.some(q => q.text === currentQuote.text && q.author === currentQuote.author);

    // Update button icon
    favoriteBtn.innerHTML = isFavorite ?
        '<i class="fas fa-heart"></i>' :
        '<i class="far fa-heart"></i>';
}

function renderFavoriteQuotes() {
    const favoritesContainer = document.getElementById('favorite-quotes-container');
    favoritesContainer.innerHTML = '';

    let favoriteQuotes = JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');

    if (favoriteQuotes.length === 0) {
        favoritesContainer.innerHTML = '<p class="no-favorites">No favorite quotes yet. Use the heart button to save quotes you love!</p>';
        return;
    }

    favoriteQuotes.forEach(quote => {
        const quoteCard = document.createElement('div');
        quoteCard.classList.add('favorite-quote-card');

        quoteCard.innerHTML = `
            <p class="quote-text">${quote.text}</p>
            <p class="quote-author">- ${quote.author}</p>
            ${quote.category ? `<span class="quote-category">${quote.category}</span>` : ''}
            <div class="favorite-quote-actions">
                <button class="remove-favorite" data-text="${quote.text}"><i class="fas fa-trash"></i></button>
                <button class="share-favorite" data-text="${quote.text}"><i class="fas fa-share-alt"></i></button>
            </div>
        `;

        favoritesContainer.appendChild(quoteCard);

        // Add event listeners for action buttons
        quoteCard.querySelector('.remove-favorite').addEventListener('click', () => removeFavorite(quote));
        quoteCard.querySelector('.share-favorite').addEventListener('click', () => shareQuote(quote));
    });
}

function removeFavorite(quote) {
    let favoriteQuotes = JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');

    // Filter out the quote to remove
    favoriteQuotes = favoriteQuotes.filter(q => !(q.text === quote.text && q.author === quote.author));

    // Save to local storage
    localStorage.setItem('brightDaysFavoriteQuotes', JSON.stringify(favoriteQuotes));

    // Re-render favorites
    renderFavoriteQuotes();

    // Update current quote favorite button if needed
    updateFavoriteButtonState();

    // Show notification
    showNotification('Removed from favorites');
}

function shareQuote(quote = currentQuote) {
    if (!quote) return;

    // Create share text
    const shareText = `"${quote.text}" - ${quote.author} #BrightDays`;

    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
                title: 'BrightDays Daily Motivation',
                text: shareText
            })
            .catch(error => {
                console.error('Error sharing:', error);
                fallbackShare(shareText);
            });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    // Create a temporary textarea element to copy text to clipboard
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    // Select and copy text
    textarea.select();
    document.execCommand('copy');

    // Remove textarea
    document.body.removeChild(textarea);

    // Show notification
    showNotification('Quote copied to clipboard');
}

function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector('.notification');

    if (!notification) {
        // Create notification element
        notification = document.createElement('div');
        notification.classList.add('notification');
        document.body.appendChild(notification);
    }

    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');

    // Hide notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Weather Mood Feature
function initWeatherMood() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeather(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error("Error getting location", error);
                document.getElementById('current-location').textContent = "Location access denied";
                document.getElementById('mood-suggestion').textContent = "Please enable location services for personalized suggestions.";
                showWeatherError();
            }
        );
    } else {
        document.getElementById('current-location').textContent = "Geolocation is not supported by this browser";
        showWeatherError();
    }

    loadWeatherMoodData();
}

function showWeatherError() {
    // Set default values for weather details when location is not available
    document.getElementById('weather-icon').innerHTML = '<i class="fas fa-question-circle" style="color: #ADB5BD;"></i>';
    document.getElementById('current-weather').textContent = "Weather unavailable";
    document.getElementById('current-temp').textContent = "--°C";
    document.getElementById('wind-speed').textContent = "-- m/s";
    document.getElementById('humidity').textContent = "--%";
    document.getElementById('pressure').textContent = "-- hPa";
    document.getElementById('cloud-cover').textContent = "--%";

    // Show error message in forecast
    document.getElementById('forecast-container').innerHTML = '<div class="forecast-item">Weather forecast unavailable</div>';
}

function getWeather(lat, lon) {
    // First, get the location name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
            document.getElementById('current-location').textContent = city;

            // Then fetch weather data
            fetchWeatherData(lat, lon);
        })
        .catch(error => {
            console.error("Error retrieving city name:", error);
            document.getElementById('current-location').textContent = "Your Location";
            fetchWeatherData(lat, lon);
        });
}

function fetchWeatherData(lat, lon) {
    fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const timeseries = data.properties.timeseries;
            const currentTime = new Date();

            // Find current weather data
            let closestWeather = timeseries.reduce((prev, curr) => {
                return Math.abs(new Date(curr.time) - currentTime) < Math.abs(new Date(prev.time) - currentTime) ? curr : prev;
            });

            const currentDetails = closestWeather.data.instant.details;
            const currentSymbol = closestWeather.data.next_1_hours?.summary.symbol_code ||
                closestWeather.data.next_6_hours?.summary.symbol_code ||
                'clear_sky';

            // Update UI with current weather
            updateWeatherUI(currentSymbol, currentDetails);

            // Generate forecast for the next 24 hours (6 entries at 4-hour intervals)
            updateForecast(timeseries.slice(0, 24));
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            showWeatherError();
        });
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
            // Show generic suggestions if weather moods can't be loaded
            showDefaultMoodSuggestions();
        });
}

function updateWeatherUI(weatherSymbol, details) {
    // Update main weather display
    document.getElementById('current-weather').textContent = formatWeatherDescription(weatherSymbol);
    document.getElementById('current-temp').textContent = `${details.air_temperature.toFixed(1)}°C`;

    // Update additional weather details
    document.getElementById('wind-speed').textContent = `${details.wind_speed.toFixed(1)} m/s`;
    document.getElementById('humidity').textContent = `${details.relative_humidity.toFixed(0)}%`;
    document.getElementById('pressure').textContent = `${details.air_pressure_at_sea_level.toFixed(0)} hPa`;
    document.getElementById('cloud-cover').textContent = `${details.cloud_area_fraction.toFixed(0)}%`;

    // Update weather icon
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.innerHTML = getWeatherIcon(weatherSymbol);

    // Update mood and activity suggestions
    updateWeatherSuggestions(weatherSymbol);
}

function getWeatherIcon(weatherSymbol) {
    // Expanded icon set
    const weatherIcons = {
        'clear_sky_day': '<i class="fas fa-sun" style="color: #FFC107;"></i>',
        'clear_sky_night': '<i class="fas fa-moon" style="color: #6C757D;"></i>',
        'clear_sky': '<i class="fas fa-sun" style="color: #FFC107;"></i>',
        'partly_cloudy_day': '<i class="fas fa-cloud-sun" style="color: #6C757D;"></i>',
        'partly_cloudy_night': '<i class="fas fa-cloud-moon" style="color: #6C757D;"></i>',
        'partly_cloudy': '<i class="fas fa-cloud-sun" style="color: #6C757D;"></i>',
        'cloudy': '<i class="fas fa-cloud" style="color: #ADB5BD;"></i>',
        'fair_day': '<i class="fas fa-sun" style="color: #FFC107;"></i>',
        'fair_night': '<i class="fas fa-moon" style="color: #6C757D;"></i>',
        'fair': '<i class="fas fa-sun" style="color: #FFC107;"></i>',
        'fog': '<i class="fas fa-smog" style="color: #9E9E9E;"></i>',
        'rain': '<i class="fas fa-cloud-rain" style="color: #4A8FE7;"></i>',
        'heavy_rain': '<i class="fas fa-cloud-showers-heavy" style="color: #4A8FE7;"></i>',
        'snow': '<i class="fas fa-snowflake" style="color: #DEE2E6;"></i>',
        'sleet': '<i class="fas fa-cloud-meatball" style="color: #ADB5BD;"></i>',
        'thunder': '<i class="fas fa-bolt" style="color: #FF5722;"></i>',
        'thunderstorm': '<i class="fas fa-bolt" style="color: #FF5722;"></i>',
        'drizzle': '<i class="fas fa-cloud-rain" style="color: #6C757D;"></i>',
        'hail': '<i class="fas fa-cloud-meatball" style="color: #DEE2E6;"></i>',
    };

    // Parse the weather symbol to handle day/night variants
    const baseSymbol = weatherSymbol.split('_').slice(0, -1).join('_') || weatherSymbol;

    return weatherIcons[weatherSymbol] || weatherIcons[baseSymbol] || '<i class="fas fa-question-circle" style="color: #6C757D;"></i>';
}

function formatWeatherDescription(symbolCode) {
    // Remove day/night suffix and convert to readable format
    let description = symbolCode.replace(/_day|_night/g, '').replace(/_/g, ' ');
    return capitalizeFirstLetter(description);
}

function updateForecast(timeseries) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear existing forecast

    // Get forecast at 4-hour intervals for the next 24 hours
    const forecastIntervals = [0, 4, 8, 12, 16, 20];

    forecastIntervals.forEach(intervalIndex => {
        if (timeseries[intervalIndex]) {
            const forecastTime = new Date(timeseries[intervalIndex].time);
            const symbol = timeseries[intervalIndex].data.next_1_hours?.summary.symbol_code ||
                timeseries[intervalIndex].data.next_6_hours?.summary.symbol_code ||
                'clear_sky';
            const temp = timeseries[intervalIndex].data.instant.details.air_temperature;

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');

            forecastItem.innerHTML = `
                <div class="time">${formatForecastTime(forecastTime)}</div>
                <div class="forecast-icon">${getWeatherIcon(symbol)}</div>
                <div class="forecast-temp">${temp.toFixed(1)}°C</div>
            `;

            forecastContainer.appendChild(forecastItem);
        }
    });
}

function formatForecastTime(date) {
    // Format time as "HH:00" or show "Now" for current hour
    const now = new Date();

    if (date.getDate() === now.getDate() && date.getHours() === now.getHours()) {
        return 'Now';
    }

    return date.getHours().toString().padStart(2, '0') + ':00';
}

function showDefaultMoodSuggestions() {
    document.getElementById('mood-suggestion').textContent = "Take a moment to appreciate the day, regardless of the weather.";

    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';

    const defaultActivities = [
        "Practice mindfulness for 10 minutes",
        "Stay hydrated throughout the day",
        "Connect with a friend or family member",
        "Read something that inspires you",
        "Take short breaks during work to stretch"
    ];

    defaultActivities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = activity;
        activitiesList.appendChild(li);
    });
}

function updateWeatherSuggestions(currentWeather = 'clear_sky') {
    if (Object.keys(weatherData).length === 0) {
        showDefaultMoodSuggestions();
        return;
    }

    // Normalize the weather symbol by removing day/night suffix
    const normalizedWeather = currentWeather.replace(/_day|_night/g, '');

    // Find matching weather mood or use default
    const weatherMood = weatherData.find(item =>
            item.weather.toLowerCase() === normalizedWeather.replace(/_/g, ' ')) ||
        weatherData.find(item => item.weather.toLowerCase() === 'default');

    if (weatherMood) {
        document.getElementById('mood-suggestion').textContent = weatherMood.mood;

        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';

        weatherMood.activities.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity;
            activitiesList.appendChild(li);
        });
    } else {
        showDefaultMoodSuggestions();
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