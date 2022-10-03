const ct = document.getElementById('doughnut').getContext('2d');
const myChat = new Chart(ct, {
    type: 'doughnut',
    data: {
        labels: ['Revenue Earned', 'Discount Money'],
        datasets: [{
            label: 'Total Expences',
            data: [35,65],
            backgroundColor: [
                '#FFBD2E',
                '#E100FF'
            ],
            borderColor: [
                '#ffffff',
                '#E100FF'
            ],
            borderWidth: 1,
            
        }]
    },
    options: {
        responsive: true
    }
});