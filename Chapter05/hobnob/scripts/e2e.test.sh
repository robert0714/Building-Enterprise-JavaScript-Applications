#!/bin/bash

# Set environment variables from .env and set NODE_ENV to test
export $(cat .env | grep -v "^#" | xargs)
export NODE_ENV=test

# Run our API server as a background process
yarn run serve &

# Polling to see if the server is up and running yet
TRIES=0
RETRY_LIMIT=50
RETRY_INTERVAL=0.2
SERVER_UP=false
while [ $TRIES -lt $RETRY_LIMIT ]; do
  if netstat -tulpn 2>/dev/null | grep -q ":$SERVER_PORT_TEST.*LISTEN"; then
    SERVER_UP=true
    break
  else
    sleep $RETRY_INTERVAL
    let TRIES=TRIES+1
  fi
done

# Only run this if API server is operational
if $SERVER_UP; then
  # Run the test in the background
  npx dotenv cucumber-js spec/cucumber/features -- --compiler js:@babel/register --require spec/cucumber/steps &

  # Waits for the next job to terminate - this should be the tests
  # wait -n
  sleep 1s
fi

# Terminate all processes within the same process group by sending a SIGTERM signal
kill -15 0
