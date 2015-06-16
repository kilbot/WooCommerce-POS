module.exports = function() {

  this.Given(/^I have logged in to the POS$/, function () {
    return this.login();
  });

}