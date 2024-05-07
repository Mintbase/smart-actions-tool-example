#!/bin/bash

IMAGE_NAME="ref-agent"
CONTAINER_NAME="ref-agent-container"
PORT=3300

docker build -t $IMAGE_NAME .

existing_container=$(docker ps -a -q -f name=^$CONTAINER_NAME$)
if [ -n "$existing_container" ]; then
    echo "Container $CONTAINER_NAME already exists, stopping and removing it..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

docker run -d -p $PORT:$PORT --name $CONTAINER_NAME $IMAGE_NAME