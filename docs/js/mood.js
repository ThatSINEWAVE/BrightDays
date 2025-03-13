let moodChart;

function logMood() {
    const mood = document.getElementById('mood-select').value;
    const date = new Date().toLocaleDateString();

    const moods = JSON.parse(localStorage.getItem('moodData') || '[]');
    moods.push({
        date,
        mood
    });
    localStorage.setItem('moodData', JSON.stringify(moods));

    updateChart();
}

function updateChart() {
    const moods = JSON.parse(localStorage.getItem('moodData') || '[]');
    const ctx = document.getElementById('mood-chart').getContext('2d');

    if (moodChart) moodChart.destroy();

    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: moods.map(entry => entry.date),
            datasets: [{
                label: 'Mood Level',
                data: moods.map(entry => ({
                    y: {
                        happy: 3,
                        neutral: 2,
                        sad: 1
                    } [entry.mood]
                })),
                borderColor: '#3498db',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 4,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return {
                                1: 'Sad',
                                2: 'Neutral',
                                3: 'Happy'
                            } [value] || '';
                        }
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (context) => context[0].label
                    }
                }
            }
        }
    });
}

// Initialize chart when page loads
document.addEventListener('DOMContentLoaded', updateChart);