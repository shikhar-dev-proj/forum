#!/bin/bash

echo Enter the version :
read version

docker build -t shikharsharma1996/forum:$version .
docker push shikharsharma1996/forum:$version

ssh root@167.71.230.177 "docker pull shikharsharma1996/forum:$version && docker tag shikharsharma1996/forum:$version dokku/api:$version && dokku deploy api $version"

