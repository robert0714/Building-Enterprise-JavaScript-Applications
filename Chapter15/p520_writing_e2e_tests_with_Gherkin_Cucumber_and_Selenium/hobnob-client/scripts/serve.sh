#!/bin/bash

# Set environment variables from .env and set NODE_ENV to test
source <(npx dotenv-export | sed 's/\\n/\n/g')
export NODE_ENV=test

yarn run build

echo -e "\n----------WEB_SERVER_PORT_TEST: $WEB_SERVER_PORT_TEST  ----------"
http-server dist/    -p $WEB_SERVER_PORT_TEST --cors