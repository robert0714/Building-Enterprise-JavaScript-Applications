import { After, Before ,Given, When, Then } from 'cucumber';
import webdriver from 'selenium-webdriver'; 

Before(function () {
  this.driver = new webdriver.Builder()
    .forBrowser("chrome")
    .build();
  return this.driver;
});

After(function () {
  this.driver.quit();
});

When('user navigates to \/', function () {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When('user types in {string} in the {string} element', function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When('user types in {string} in the {string} element', function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Then('the {string} element should have a {string} attribute', function (string, string2) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});