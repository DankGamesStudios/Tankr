#!/bin/bash

consts=""

if [ -n "$1" ]; then
  consts=-$1;
fi;

source constants$consts.sh

docker build -t $DOCKER_USER$IMAGE:$TAG -f $TARGET .

echo "Built $IMAGE:$TAG"
