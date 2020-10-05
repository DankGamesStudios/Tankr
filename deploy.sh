#!/bin/bash

consts=""

if [ -n "$1" ]; then
  consts=-$1;
fi;

source constants$consts.sh

./build.sh $1

docker push $DOCKER_USER$IMAGE:$TAG
