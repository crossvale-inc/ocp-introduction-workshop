FROM registry.redhat.io/rhel8/dotnet-80:8.0 AS build-env

USER 0

COPY ./*.csproj ./

COPY . ./

RUN dotnet publish -c Release -o out

# build runtime image
FROM registry.redhat.io/rhel8/dotnet-80-runtime:8.0

USER 1001

COPY --from=build-env /opt/app-root/src/out /opt/app-root/src/out

WORKDIR /opt/app-root/src/out

ENTRYPOINT ["dotnet", "front-end-service.dll", "--urls=http://+:8080"]