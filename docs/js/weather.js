function getWeatherSuggestions() {
    const weatherType = document.getElementById('weather-type').value;
    const suggestionsDiv = document.getElementById('weather-suggestions');

    fetch('data/weather_activities.json')
        .then(response => response.json())
        .then(data => {
            const suggestions = data[weatherType] || data['Sunny'];
            suggestionsDiv.innerHTML = `
                <h3>${weatherType} Weather Suggestions</h3>
                <p>Recommended Mood: <strong>${suggestions.mood}</strong></p>
                <p>Suggested Activities:</p>
                <ul>${suggestions.activities.map(a => `<li>${a}</li>`).join('')}</ul>
            `;
        });
}