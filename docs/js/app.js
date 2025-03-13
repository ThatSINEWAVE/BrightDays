function initializeApp() {
    // Set current year in footer
    document.querySelector('#year').textContent = new Date().getFullYear();

    // Initialize navigation
    const navLinks = [{
            href: 'index.html',
            text: 'Home'
        },
        {
            href: 'motivation.html',
            text: 'Daily Motivation'
        },
        {
            href: 'weather.html',
            text: 'Weather Mood'
        },
        {
            href: 'mood.html',
            text: 'Mood Tracker'
        },
        {
            href: 'gratitude.html',
            text: 'Gratitude Journal'
        }
    ];

    const nav = document.querySelector('nav ul');
    if (nav) {
        nav.innerHTML = navLinks.map(link => `
            <li><a href="${link.href}"${location.pathname.endsWith(link.href) ? ' class="active"' : ''}>${link.text}</a></li>
        `).join('');
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initializeApp);