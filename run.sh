#!/bin/bash

consts=""

if [ -n "$1" ]; then
  consts=-$1;
fi;

source constants$consts.sh

docker run --name=$IMAGE -d -p $PORT:$EXPOSE_PORT -e PORT=$EXPOSE_PORT -e HOSTNAME=$HOSTNAME $DOCKER_USER$IMAGE:$TAG
