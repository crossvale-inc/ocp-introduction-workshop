getButton.addEventListener("click", () => {
    fetch('http://front-end-service-test-script.apps-crc.testing/weather')
        .then(response => { 
            return response.json()
        })
        .then(data => {
            
            var html  = '<table id=\'dataset\'><tr><th>DATE</th><th>SUMMARY</th><th>TEMPERATURE F</th><th>TEMPERATURE C</th>'

            data.forEach(forecast => {
                html+= `<tr><td>${forecast.date}<td><td>${forecast.summary}<td><td>${forecast.temperatureF}<td><td>${forecast.temperatureC}<td></tr>`
            })

            html+= '</table>'
            
            document.getElementById('my-table')
                    .replaceChildren('')

            document.getElementById('my-table') .insertAdjacentHTML('beforeend', html)
        }) 
  });