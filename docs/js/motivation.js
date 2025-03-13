function getDailyQuote() {
    const today = new Date().toDateString();
    const lastQuoteDate = localStorage.getItem('lastQuoteDate');
    const quoteContainer = document.getElementById('quote-container');

    if (today === lastQuoteDate) {
        quoteContainer.innerHTML = localStorage.getItem('dailyQuote');
        return;
    }

    fetch('data/motivation.json')
        .then(response => response.json())
        .then(data => {
            const quotes = data.quotes;
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const quoteHTML = `<p class="quote">${randomQuote}</p>`;

            localStorage.setItem('dailyQuote', quoteHTML);
            localStorage.setItem('lastQuoteDate', today);
            quoteContainer.innerHTML = quoteHTML;
        });
}