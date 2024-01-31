using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace front_end_service.Controllers
{
    [ApiController]
    public class FrontEndController
    {
        private readonly string backEndServiceEndpoint;
        public FrontEndController(IConfiguration configuration) {
            this.backEndServiceEndpoint = configuration["back-end-service:endpoint"];
        }

        [HttpGet("/weather")]
        public async Task<string> GetWeatherForecast()
        {
            HttpClient simpleHttpClient = new HttpClient();

            //HTTP Client configuration
            HttpResponseMessage response = await simpleHttpClient.GetAsync(backEndServiceEndpoint);

            return await response.Content.ReadAsStringAsync();
        }
    }
}
