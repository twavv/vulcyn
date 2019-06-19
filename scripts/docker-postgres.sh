#!/bin/sh
set -xe

docker run \
    --rm \
    -it \
    -e POSTGRES_USER="test" \
    -p 5432:5432 \
    postgres
