const ctx = document.getElementById('lineChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        
        labels: ['12:00','14:00','16:00','18:00','20:00','22:00','24:00','2:00','4:00','5:00','6:00','7:00','8:00','10:00'],
        datasets: [{
            label: '# of TIME',
            data: [7500,28000,15000,15000,30000,27000,30000,22000,27000,37000,29000,20000,22000,17000],
            
            backgroundColor: [
                '#F450CA',
            ],
            borderColor: [
                '#F450CA',
            ],
            borderWidth: 1
        },
        {
                label: '# of VISITS',
                data: [700,28000,35000,10000,30000,27000,30000,2000,20000,30000,39000,23000,12000,37000],
                
                backgroundColor: [
                    '#3905D4',
                    
                ],
                borderColor: [
                    '#3905D4',
                    
                ],
                borderWidth: 1
            }
    ],
    },
    options: {
        responsive:true 
    }
});
