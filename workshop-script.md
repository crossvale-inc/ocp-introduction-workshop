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

USER 0

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

Openshfit container platform simplifies the configuration requirements to run containers and to discover the IP addrress among other things.

In order to run a container in Openshift it is required to have an image created. 

It is possible to create a `BuildConfig` object which describes how an image can be built. The build configuration can be binary, which means that it will require an input in order to be executed, other option could be to add a git repository as the build configuration source.

It is possible to create a `BuildConfig` by executing the following commmand:

```
oc new-build --name back-end-service --binary=true
```

Which Generates a `BuildConfig` object and an `ImageStream`, the image stream is required in order to have a reference to an image stored in the Openshift image registry.

An `ImageStream` provides an abstraction layer to manage images in Openshfit, it presents a virtual view of the images to which it is associated. 

When you define an object that references an image stream tag, such as a build or deployment configuration, you point to an image stream tag and not the repository. When you build or deploy your application, OpenShift Container Platform queries the repository using the image stream tag to locate the associated ID of the image and uses that exact image.

The objects created by the previous command are:

```
kind: BuildConfig
apiVersion: build.openshift.io/v1
metadata:
  annotations:
    openshift.io/generated-by: OpenShiftNewBuild
  name: back-end-service
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
```

And the image stream:

```
kind: ImageStream
apiVersion: image.openshift.io/v1
metadata:
  name: back-end-service
  labels:
    build: back-end-service
spec:
  lookupPolicy:
    local: false
```

To start the `back-end-service` image build it is necessary to upload the content to the build. In order to to that, move to the back-end-service root folder and execute the following command that indicates the current directory as the input for the binary build:

```
oc start-build back-end-service --from-dir=. --follow
```

Since there is a `Dockerfile` in the root folder of the input, it will build the image according to the steps specified in that `Dockerfile`.

The same procedure can be followed to build an image for the front end service.

## Lab2 Deploy a .NET Microservice

When an image is built in openshift it is possible to run a container within a pod that executes the specified image.

It is possible to run a pod with a simple `oc` command:

```
oc run back-end-service --image=image-registry.openshift-image-registry.svc:5000/workshop/back-end-image:latest
```

When the pod is created, it is possible to open a terminal inside the container or to see the container logs from the Openshfit console. In order to test if the image is running correcltly, it is possible connect to the running pod:

```
oc rsh back-end-service
```

And execute a curl command:

```
$ curl http://localhost:8080/weatherForecast
[{"date":"2024-01-30","temperatureC":-17,"summary":"Cool","temperatureF":2},{"date":"2024-01-31","temperatureC":37,"summary":"Chilly","temperatureF":98},{"date":"2024-02-01","temperatureC":36,"summary":"Sweltering","temperatureF":96},{"date":"2024-02-02","temperatureC":14,"summary":"Sweltering","temperatureF":57},{"date":"2024-02-03","temperatureC":19,"summary":"Mild","temperatureF":66}]
```

It is possible to do the same and run the front-end-service as another pod in Openshift.

When the front-end-service is running, there should be two pods running within the same namespace:

```

```

The front-end-service will not be able to return a valid response since the Pod Ip of the back-end-servie is not configured. It is not recommended to manually configure a Pod IP as an endpoint because it is different for each Pod.

To discover the Pod Ip of the back end service, run the following command:

```
oc get pod back-end-service  -o jsonpath='{.status.podIP}'
```

If a curl is executed from the front end pod to that ip:

```
curl http://10.217.0.107:8080/weatherForecast
```

If the back-end-service pod is deleted then IP will change, the pod name `back-end-service` is not valid because the front end pod will not be able to resolve the host name `back-end-service`.

```
curl http://back-end-service:8080/weatherForecast
```

To resolve this problem, it is possible to create a `Service`:

```
apiVersion: v1
kind: Service
metadata:
  name: back-end-service
spec:
  selector:
      run: back-end-service
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080
```

After the service is created, if the same curl to the `back-end-service` host it works because it is able to resolve the ip since there is a service called `back-end-service`:

```
curl http://back-end-service:8080/weatherForecast
```

In Openshift there is the concept of health probes on pods that are used to monitor if an application healthy, a health probe periodically performs diagnostics in a running container to check if it is still alive or if it is ready to accept incoming traffic.

There are three typesof probes:

* Startup Probe
** Indicates wheter the application within a container is started. All other probes are disabled until the Startup Probe is successful.
* Liveness Probe
** Determines if a container is running, if it fails the cluster kills the container.
* Readiness Probe
** Determines if a container is ready to accept incoming traffic, if it fails it removes the container from the list of available endpoints.

All the probes can be configured as:

* HTTP GET operation
** A successful operation is considered if the HTTP status code returned is between 200-399
* Command
** Executes a command in the container, is successful if it exists with s 0 status.
* TCP socket
** If a connection is established the probe is successful

Other important configuration for Pods are the resources available to each container. The resources can be specified as `request` or as a `limit`. 

When the request is specified the Pod will be scheduled in a node that has resources free to guarantee that the requested resource is available. 

A limit, however, is the maximum amount of that resource that a container can consume.

If there are multiple containers within a Pod, the request and limit of that Pod is the sum of the requests and limits in all containers in the Pod.

On the other hand, it is not recommended to run pods in isolation. If a pod is deleted, it dies and a new pod needs to be created manually and all pods need to be configured as separated resources which makes the configuration management difficult since all pods of the same service in a given namespace will probably have the same configuration.

To manage pods easily, it is possible to create a `Deployment` object, which manages the pod status to match desired status specified in the YAML and is able to ensure that the number of replicas specified are running.

Before continuing, delete the created pods and service: 

```
oc delete pod back-end-service
oc delete pod front-end-service
oc delete service back-end-service
```

To create a Deployment, create the following YAML: 

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: back-end-service
  labels:
    app: back-end-service
spec:
  replicas: 1
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
        image: image-registry.openshift-image-registry.svc:5000/workshop/back-end-service
        ports:
        - containerPort: 8080
```

It is possible to create multiple pods with the same specification by changing the number of replicas in the `Deployment` specification, also, if a pod is deleted a new one will be created.

If a change of the specification is done, it will redeploy a new version of all the pod replicas that will match the new speification.
Shwo that a yaml change on deployment produces a redeploy of all pods.

To enable the communication across pods, create a service for the back-end-service deployment:

```
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
```

It is possible to create a deployment and a service for the front-end-service the same way as with the back end service but changing the image that the containers within the pod need to run.
Create a deployment and a service for front end

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-end-service
  labels:
    app: front-end-service
spec:
  replicas: 1
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
        image: image-registry.openshift-image-registry.svc:5000/workshop/front-end-service
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
```

The service created only allows communication within the cluster, the PodIps are only accesible to services running inside the Openshift cluster. It is possible to enable communication to consumers outside the cluster by creating an Openshift `Route`:

To expose the front end from outside the cluster create a route:

```
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
```

If the route name is bigger than 63 characters the route creation will fail, try to specify a hostname like the following:

```
  host: front-end-service-mrivas-w8mjp0.apps.oscadetest.bank.ad.bxs.com
```

When the route is creted, it is possible to discover the hostname by executing the command:

```
oc get routes
```

If a curl is executed to that route, a successful response will be obtained:

```
curl http://<route_host>/weather
````

This means that the `front-end-service` is exposing the weather forecast to external consumers, so it is possible to implement a web-application that consumes that service and shows the weather information.

Create a new folder that will include the `web-application` resources:

```
mkdir web-application
```

Create a file named `index.html` with the following content:

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workshop</title>
    <script src="./index.js" defer></script>
  </head>
  <style>
    .content {
      max-width: 500px;
      margin: auto;
    }
    </style>
  <body class="content">
    <h1>Weather Forecast</h1>
    <button id="getButton">GET Data</button>
    <div id="my-table"></div>
  </body>
</html>
```

And also a Javascript file named `index.js` in the same folder, mind that the url in your case could be different.

```
getButton.addEventListener("click", () => {
    fetch('http://front-end-service-route/weather')
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
```

In the same way as with the back-end and front-end services it is also needed to create a `Dockerfile` which is this case is going to be based on a web-server:

```
FROM nginx:alpine

COPY index.html /usr/share/nginx/html
COPY index.js /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod 644 /usr/share/nginx/html/index.html
RUN chmod 644 /usr/share/nginx/html/index.js
```

Create the build for the web application:

```
oc new-build --name web-application --binary=true
```

Create the image:

```
oc start-build web-application --from-dir=. --follow
```

Finally, create a Deployment, a service and a route to be able to load the HTML resource from the browser:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-application
  labels:
    app: web-application
spec:
  replicas: 1
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
        image: image-registry.openshift-image-registry.svc:5000/test-script/web-application
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
  to:
    kind: Service
    name: web-application
```

If the web-application route is accessed, it should show the weather forecast that communicates to the front end service route.

## Lab3 Configuration Management and PVCs

One of the benefits of containers is to promote the configuration from one environment to the next.

To be able to achive this it is necessary to be able to inject the configuration of each environment dinamically.

A configmap can be created:

```
kind: ConfigMap
apiVersion: v1
metadata:
  name: service-config
data:
  appSettings.json: |
    {
        "back-end-service": {
            "endpoint": "http://back-end-service:8080/weatherForecast"
        }
    }
```

Change the code to be able to load the config from a JSON file:

```
    builder.Configuration.AddJsonFile("/opt/app-root/config/appSettings.json", optional: false, reloadOnChange: true);
```

And enable the `IConfiguration` injection:

```
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace front_end_service.Controllers
{
    [ApiController]
    public class FrontEndController
    {
        private readonly backEndServiceEndpoint;
        public FrontEndController(IConfiguration configuration) {
            this.backEndServiceEndpoint = configuration["back-end-service:endpoint"]
        }

        [HttpGet("/weather")]
        public async Task<string> GetWeatherForecast()
        {
            HttpClient simpleHttpClient = new HttpClient();

            //HTTP Client configuration
            HttpResponseMessage response = await simpleHttpClient.GetAsync("backEndServiceEndpoint");

            return await response.Content.ReadAsStringAsync();
        }
    }
}
```

Create the configMap volume:

```
spec:
  volumes:
  - name: config-volume
    configMap:
        name: service-config
```

And mount it:

```
  containers:
    - volumeMounts:
          - name: config-volume
             mountPath: /opt/app-root/config

```

For kustomize, create a standard kustomize folder structure:

```
kustomize/
  base-dotnet/
    deployment.yaml
    service.yaml
    kustomization.yaml
  overlays/
    back-end-service/
      base/
        kustomization.yaml
        patch_deployment.yaml
        patch_service.yaml
```

Add the front-end service configuration to be deployed with kustomize.

Add a configmap from file and create a route to be created only in the front-end

## Lab4 Configure Autoscaling

One of the biggest benefits of running pods in Openshift is to take advantage of the automatic horizontal pod autoscaler.

The `HorizontalPodAutoscaler` automatically increases or decreases the scale of a deployment, based on metrics collected from the pods that belong to that deployment specification.

There are multiple metrics available to configure the automatic autoscaling but basically the autoscaling can be based:

* CPU Utilization
* Memory Utilization

An example of the metrics for an autoscale is to configure the desired value of `AverageValue` for cpu utilization on the back-end-service:

```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cpu-autoscale 
spec:
  scaleTargetRef:
    apiVersion: apps/v1 
    kind: Deployment 
    name: back-end-service 
  minReplicas: 1 
  maxReplicas: 10 
  metrics: 
  - type: Resource
    resource:
      name: cpu 
      target:
        type: AverageValue 
        averageValue: 30m
```

If the back-end service has enough load to have a cpu consumption bigger than `30m` the HPA will automatically scale the deployment.

To simulate load and check the autoscaling execute the following command until the cpu consumption of the back-end-service increases:

```
seq 1 1000 | xargs -n1 -P10  curl "http://back-end-service:8080/weatherForecast"
```

It is possible to validate that the number of pods of the back-end-service scales automatically

To run a jmeter script, use the following jmx file (you may need to change the number of threads):

```
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Test Plan">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group">
        <intProp name="ThreadGroup.num_threads">1</intProp>
        <intProp name="ThreadGroup.ramp_time">60</intProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller">
          <stringProp name="LoopController.loops">600</stringProp>
          <boolProp name="LoopController.continue_forever">false</boolProp>
        </elementProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="HTTP Request">
          <stringProp name="HTTPSampler.domain">back-end-service</stringProp>
          <stringProp name="HTTPSampler.port">8080</stringProp>
          <stringProp name="HTTPSampler.protocol">http</stringProp>
          <stringProp name="HTTPSampler.path">/weatherForecast</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.postBodyRaw">false</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>


```

To run jmeter from the command line:

```
jmeter -n -t <my-jmx-script>
```