function saveEntry() {
    const entry = document.getElementById('gratitude-entry').value.trim();
    const date = new Date().toISOString().split('T')[0];

    if (!entry) {
        alert('Please write something before saving!');
        return;
    }

    const entries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
    entries.push({
        date,
        entry
    });
    localStorage.setItem('gratitudeEntries', JSON.stringify(entries));

    displayEntries();
    document.getElementById('gratitude-entry').value = '';
}

function displayEntries() {
    const entries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
    const container = document.getElementById('past-entries');

    container.innerHTML = entries.reverse().map(entry => `
        <div class="entry">
            <h4>${entry.date}</h4>
            <p>${entry.entry}</p>
        </div>
    `).join('');
}

// Display existing entries on page load
displayEntries();