# XV Cadence Workshop

Useful links:

* DevSpaces
** https://devspaces.apps.oscadetest.bank.ad.bxs.com
* Openshift Documentaion
** https://access.redhat.com/documentation/en-us/openshift_container_platform/4.14
* Kubernetes documentation
** https://Kubernetes.io

## Lab 1

### Lab 1.1 Implement the Back-End application

Create a dotnet web api:

```
dotnet new webapi -n back-end-service
```

This templates provides a weather forecast application that will be used as a back-end service.

To build the application, move to the application folder:

```
$ cd back-end-service
```

```
$ dotnet build
MSBuild version 17.8.3+195e7f5a3 for .NET
  Determining projects to restore...
  All projects are up-to-date for restore.
  back-end-service -> C:\Users\MarcosRivasBernaldod\Projects\Crossvale\Cadence\workshop resources\workshop-services\back-end-service\bin\Debug\net8.0\back-end-service.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:12.18
```

To run the application locally:

```
$ dotnet run
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5118
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\Users\MarcosRivasBernaldod\Projects\Crossvale\Cadence\workshop resources\workshop-services\back-end-service
```

To test the application:

```
$ curl http://localhost:5118/weatherforecast
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   381    0   381    0     0  23287      0 --:--:-- --:--:-- --:--:-- 25400[{"date":"2024-01-26","temperatureC":-3,"summary":"Cool","temperatureF":27},{"date":"2024-01-27","temperatureC":21,"summary":"Balmy","temperatureF":69},{"date":"2024-01-28","temperatureC":20,"summary":"Hot","temperatureF":67},{"date":"2024-01-29","temperatureC":20,"summary":"Chilly","temperatureF":67},{"date":"2024-01-30","temperatureC":7,"summary":"Freezing","temperatureF":44}]
```

### Lab 1.2 Implement the Front-End application

Create a front end service that integrates with the weather forecast back end service.

To do this create a new webapi application, from the repository root folder:

```
dotnet new webapi -n front-end-service
```

Move into the front-end-service folder:

```
cd front-end-service
```

Create a Controllers folder:

```
 mkdir Controllers
```

Create the Controller file:

```
touch Controllers/FrontEndController.cs
```

Paste the following code in the `FrontEndController.cs` file:

```
using Microsoft.AspNetCore.Mvc;

namespace front_end_service.Controllers
{
    [ApiController]
    public class FrontEndController
    {
        [HttpGet("/weather")]
        public string GetWeatherForecast()
        {
            return "Hello from FrontEndController";
        }
    }
}
```

The dotnet template has included some code in the front end application that is not needed. The weather forecast configuration should be removed and the controller implemented should be added.

To do this, remove the following piece of code of `Program.cs`

```
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
```

Also:

```
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();
```

To add the controller, configure the `Program.cs` adding:

```
builder.Services.AddControllers();
```

And also:

```
app.MapControllers();
```

The `Program.cs` should be now configured as:

```
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
```

If the application is run:

```
$ dotnet run
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5140
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\Users\MarcosRivasBernaldod\Projects\Crossvale\Cadence\workshop resources\workshop-services\front-end-service
warn: Microsoft.AspNetCore.HttpsPolicy.HttpsRedirectionMiddleware[3]
      Failed to determine the https port for redirect
```

It is possible to consume the weather front end service:

```
$ curl http://localhost:5140/weather
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    29    0    29    0     0   1819      0 --:--:-- --:--:-- --:--:--  1933Hello from FrontEndController
```

Now, the `FrontEndController.cs` class will be modified to obtain the weather forecast from the back-end service

To do this, replace the content of the `FrontEndController.cs`:

```
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
```

If both services are execute at the same time, if a curl is send to the front end service:

```
$ curl http://localhost:5140/weather
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     100   387    0   387    0     0   2415      0 --:--:-- --:--:-- --:--:--  2433[{"date":"2024-01-26","temperatureC":18,"summary":"Sweltering","temperatureF":64},{"date":"2024-01-27","temperatureC":-15,"summary":"Hot","temperatureF":6},{"date":"2024-01-28","temperatureC":41,"summary":"Sweltering","temperatureF":105},{"date":"2024-01-29","temperatureC":31,"summary":"Warm","temperatureF":87},{"date":"2024-01-30","temperatureC":0,"summary":"Mild","temperatureF":32}]
```
