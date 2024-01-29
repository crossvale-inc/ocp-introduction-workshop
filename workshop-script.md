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

### Lab 1.3 Create Back-End Service Container Image

To create the container image to run the application it is required to configure a Dockerfile with the expected frameworks and commands that build and deploy the .NET application.

The base image required, is an official redhat .NET 8 image:

```
FROM registry.redhat.io/rhel8/dotnet-80:8.0 AS build-env 
```

This image will be used to build the application. To build the application it is required to copy the resources to the image and run the required dotnet commands. A Dockerfile example is the following:

```
FROM registry.redhat.io/rhel8/dotnet-80:8.0 AS build-env

USER 1001

COPY ./*.csproj ./

COPY . ./

RUN dotnet publish -c Release -o out

# build runtime image
FROM registry.redhat.io/rhel8/dotnet-80-runtime:8.0

USER 1001

COPY --from=build-env /opt/app-root/src/out /opt/app-root/src/out

EXPOSE 8080

WORKDIR /opt/app-root/src/out

ENTRYPOINT ["dotnet", "back-end-service.dll", "--urls=http://+:8080"]
```

The first part of the Dockerfile is building the application by executing the `dotnet publish` command:

````
FROM registry.redhat.io/rhel8/dotnet-80:8.0 AS build-env

USER 1001

COPY ./*.csproj ./

COPY . ./

RUN dotnet publish -c Release -o out
```

And the second part is copying the artifact build by the previous step and configuring the entrypoint which is the command that will be run when the image starts. As a note to the configuration, the application url is now configured to be exposed as HTTP in the port 8080, this is possible since the containers of each application will be isolated from each other.

```
FROM registry.redhat.io/rhel8/dotnet-80-runtime:8.0

USER 1001

COPY --from=build-env /opt/app-root/src/out /opt/app-root/src/out

EXPOSE 8080

WORKDIR /opt/app-root/src/out

ENTRYPOINT ["dotnet", "back-end-service.dll", "--urls=http://+:8080"]
```

It is possible now to build an run the images and connect the containers with each other. 

It is possible to build and run the back-end service image:

```
podman build . -t back-end-service:latest
```

And to run the application:

```
podman run back-end-service
```

To test if the application works, it is possible to test a `curl` command within the container that is running, mind that the container id may be different in each case:

```
podman exec -it 1179077c1be2 curl http://localhost:8080/weatherForecast
[{"date":"2024-01-30","temperatureC":5,"summary":"Sweltering","temperatureF":40},{"date":"2024-01-31","temperatureC":-14,"summary":"Cool","temperatureF":7},{"date":"2024-02-01","temperatureC":21,"summary":"Scorching","temperatureF":69},{"date":"2024-02-02","temperatureC":19,"summary":"Cool","temperatureF":66},{"date":"2024-02-03","temperatureC":-19,"summary":"Scorching","temperatureF":-2}]
```

It is possible to build and run the front-end application by executing the same commands as in the back-end service.

In order to connect the front-end-service with the back-end-service, it is required to discover the IP address of the back-end-service container.

To have an IP assigned, it is possible to select the default `bridge` network of postman:

```
 podman run --net=bridge back-end-service:latest
```

To discover the IP, it is possible to find it in the output of the following command:

```
podman inspect -f '{{.NetworkSettings.IPAddress}}' e68f98e25056
```

The previous command will show an IP address that needs to be configured in the front-end-service HttpClient. Change the code, rebuild the image and execute a curl in the front-end-service container.

```
$ podman exec 614606cdfb66 curl http://localhost:8080/weather
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   390    0   390    0     0  35454      0 --:--:-- --:--:-- --:--:-- 39000
[{"date":"2024-01-30","temperatureC":-4,"summary":"Hot","temperatureF":25},{"date":"2024-01-31","temperatureC":-7,"summary":"Chilly","temperatureF":20},{"date":"2024-02-01","temperatureC":19,"summary":"Chilly","temperatureF":66},{"date":"2024-02-02","temperatureC":25,"summary":"Scorching","temperatureF":76},{"date":"2024-02-03","temperatureC":23,"summary":"Sweltering","temperatureF":73}]
```

### Lab 1.4 Build Images in Openshift

oc new-build --name back-end-service --binary=true

Generates:

kind: BuildConfig
apiVersion: build.openshift.io/v1
metadata:
  annotations:
    openshift.io/generated-by: OpenShiftNewBuild
  resourceVersion: '223823'
  name: back-end-service
  uid: c55d0380-094c-4118-bb05-97f90ba7db3c
  creationTimestamp: '2024-01-26T02:47:10Z'
  generation: 1
  managedFields:
    - manager: oc
      operation: Update
      apiVersion: build.openshift.io/v1
      time: '2024-01-26T02:47:10Z'
      fieldsType: FieldsV1
      fieldsV1:
        'f:metadata':
          'f:annotations':
            .: {}
            'f:openshift.io/generated-by': {}
          'f:labels':
            .: {}
            'f:build': {}
        'f:spec':
          'f:output':
            'f:to': {}
          'f:runPolicy': {}
          'f:source':
            'f:binary': {}
            'f:type': {}
          'f:strategy':
            'f:dockerStrategy': {}
            'f:type': {}
          'f:triggers': {}
  namespace: default
  labels:
    build: back-end-service
spec:
  nodeSelector: null
  output:
    to:
      kind: ImageStreamTag
      name: 'back-end-service:latest'
  resources: {}
  successfulBuildsHistoryLimit: 5
  failedBuildsHistoryLimit: 5
  strategy:
    type: Docker
    dockerStrategy: {}
  postCommit: {}
  source:
    type: Binary
    binary: {}
  triggers:
    - type: GitHub
      github:
        secret: l2l4eM7aQqcXyPORN-x_
    - type: Generic
      generic:
        secret: gkz4-Ioe5eIiHcZzWMvo
  runPolicy: Serial
status:
  lastVersion: 0

And:

kind: ImageStream
apiVersion: image.openshift.io/v1
metadata:
  annotations:
    openshift.io/generated-by: OpenShiftNewBuild
  resourceVersion: '223822'
  name: back-end-service
  uid: 5571b527-6694-4583-84f4-8a43f925ae95
  creationTimestamp: '2024-01-26T02:47:10Z'
  generation: 1
  managedFields:
    - manager: oc
      operation: Update
      apiVersion: image.openshift.io/v1
      time: '2024-01-26T02:47:10Z'
      fieldsType: FieldsV1
      fieldsV1:
        'f:metadata':
          'f:annotations':
            .: {}
            'f:openshift.io/generated-by': {}
          'f:labels':
            .: {}
            'f:build': {}
  namespace: default
  labels:
    build: back-end-service
spec:
  lookupPolicy:
    local: false
status:
  dockerImageRepository: 'image-registry.openshift-image-registry.svc:5000/default/back-end-service'
  publicDockerImageRepository: >-
    default-route-openshift-image-registry.apps-crc.testing/default/back-end-service


Start Build, does the build for us:

$ oc start-build back-end-service --from-dir=.

Same for front-end

--> TODO 

## Lab2 Deploy a .NET Microservice

Show run a pod:

oc run back-end-service --image=back-end-service:latest

Go to terminal and logs, show logs are the same as the container

Go to terminal and run curl

show works with localhost from terminal,

show works with ip from terminal,

show works with podname from terminal,

Create a new front-end image and pod the same way

Show that in this case the pod IP to backend works but the name does not

If the pod is deleted, it does not reappear!

If the a new pod is created, it has a new IP, new node, everything!

show the problems, what happens if the application needs to scale? how to decide pod names or IPs? is not manageable if there are dozens or hunders of containers

Show the number of pods in the cluster:

oc get pods -A

Count it

oc get pods -A | wc -l

Explain how difficult it would be to manage all those pods individually

delete created back-end and front-end pods

The solution is Deployments!

Deployment yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: back-end-service
  labels:
    app: back-end-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: back-end-service
  template:
    metadata:
      labels:
        app: back-end-service
    spec:
      containers:
      - name: back-end-service
        image: image-registry.openshift-image-registry.svc:5000/default/back-end-service
        ports:
        - containerPort: 8080

Show that deployment creates multiple pods and if one is deleted then other appears, and it is easy to scale up and down.

Shwo that a yaml change on deployment produces a redeploy of all pods.

Show that the service discovery problem still occurs!

The solution is a service!

Create a service for the back-end-service and check it from a front-end pod!

to create a service create 

apiVersion: v1
kind: Service
metadata:
  name: back-end-service
spec:
  selector:
      app: back-end-service
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080


Change endpoint in front-end-service and re run the pod to see if it is able to get data

->->

Create a deployment and a service for front end

apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-end-service
  labels:
    app: front-end-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: front-end-service
  template:
    metadata:
      labels:
        app: front-end-service
    spec:
      containers:
      - name: front-end-service
        image: image-registry.openshift-image-registry.svc:5000/default/front-end-service
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: front-end-service
spec:
  selector:
      app: front-end-service
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080

To access front end from outside the cluster create a route:

apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: front-end-service
spec:
  port:
    targetPort: 8080
  to:
    kind: Service
    name: front-end-service

Show oc get routes output

Do a curl to that host:

curl http://front-end-service-default.apps-crc.testing/weather


Since the FrontEnd application needs is exposing the weather forecast to external consumers, it is possible to implement a web-application that consumes that service.

mkdir web-application

//TODO HTMLs and Jss

Copy htmls and Jss

Deploy a NGINX app to show the weather in html

oc new-build --name web-application --binary=true

Create the image:

$ oc start-build web-application --from-dir=. --follow

And deploy it with service and route:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-application
  labels:
    app: web-application
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-application
  template:
    metadata:
      labels:
        app: web-application
    spec:
      containers:
      - name: web-application
        image: image-registry.openshift-image-registry.svc:5000/default/web-application
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-application
spec:
  selector:
      app: web-application
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: web-application
spec:
  port:
    targetPort: 8080
  tls:
    termination: edge
  to:
    kind: Service
    name: web-application

NOTE: if error, mixed-blocked change front-end route ot be https.

-> Error due to CORs -> needs to be anabled

## Lab3 Configuration Management


-> TODO COnfigmaps injection
-> ENV vars
-> JSON Loading

-> Kustomize templates


## Lab4 Configure Autoscaling


