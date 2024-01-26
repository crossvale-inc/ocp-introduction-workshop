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

            HttpResponseMessage response = await simpleHttpClient.GetAsync("http://localhost:5118/weatherforecast");

            return await response.Content.ReadAsStringAsync();
        }
    }
}