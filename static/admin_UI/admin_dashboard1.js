const ct = document.getElementById('doughnut').getContext('2d');
const myChat = new Chart(ct, {
    type: 'doughnut',
    data: {
        labels: ['Total Expences', 'Total Sales'],
        datasets: [{
            label: 'Total Expences',
            data: [30,70],
            backgroundColor: [
                '#FEE500',
                '#1DAD2C'
            ],
            borderColor: [
                '#ffffff',
                '#1DAD2C'
            ],
            borderWidth: 1,
            
        }]
    },
    options: {
        responsive: true
    }
});