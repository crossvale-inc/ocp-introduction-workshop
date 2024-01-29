using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace front_end_service.Controllers
{
    [ApiController]
    public class FrontEndController
    {
        [HttpGet("/weather")]
        public async Task<string> GetWeatherForecast()
        {
            HttpClient simpleHttpClient = new HttpClient();

            //HTTP Client configuration
            HttpResponseMessage response = await simpleHttpClient.GetAsync("http://back-end-service:8080/weatherforecast");

            return await response.Content.ReadAsStringAsync();
        }
    }
}
