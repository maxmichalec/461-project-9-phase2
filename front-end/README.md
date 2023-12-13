# FrontEnd

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.8.

## Install Dependencies

Run `npm install` to install the necessary dependencies for the angular application.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io). To run the unit tests on a headless browser and exit the testing framework after the tests are complete run `ng test --browser=ChromeHeadless --watch=false`.

## Running selenium tests

The selenium tests are currently configured to run only on a localhost and not the application's AWS URL. The selenium tests should be ran from the repository's source directory `461-project-9-phase2`. 

Install the dependencies and build the application by running `npm install && npm run build`.

To setup the back end on localhost port 9000 run `node dist/src/app.js`.

To setup the front end on localhost port 4200, navigate to the front-end directory `cd front-end`, install and build the angular application with `npm install && ng build`, and server the application with `ng serve`.

Once both the front end and back end servers are running on localhost, navigate back to the source directory `461-project-9-phase2` via `cd ..`.



Run the selenium test suite by running the following commands: `chmod +x selenium-test.sh` followed by `./selenium-test.sh`. The selenium webdriver will open a browser in Chrome to run the test suite and will produce the test report in the `selenium-test.log` file.