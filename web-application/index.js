// Configure event listener to get data
getButton.addEventListener("click", () => {
    //fetch('http://localhost:5140/weather')
    fetch('https://front-end-service-default.apps-crc.testing/weather')
        .then(response => { 
            return response.json()
        })
        .then(data => {
            
            var html  = '<table id=\'dataset\'><tr><th>DATE</th><th>SUMMARY</th><th>TEMPERATURE F</th><th>TEMPERATURE C</th>'
            //document.getElementById('my-table')
            //        .insertAdjacentHTML('beforeend', '<table id=\'dataset\'><tr><th>DATE</th><th>SUMMARY</th><th>TEMPERATURE F</th><th>TEMPERATURE C</th>')
            
            data.forEach(forecast => {
                html+= `<tr><td>${forecast.date}<td><td>${forecast.summary}<td><td>${forecast.temperatureF}<td><td>${forecast.temperatureC}<td></tr>`
                
                //document.getElementById('my-table')
                //    .insertAdjacentHTML('beforeend', forecastHtml)
            })

            html+= '</table>'
            
            document.getElementById('my-table')
                    .replaceChildren('')

            document.getElementById('my-table') .insertAdjacentHTML('beforeend', html)
        }) 
  });