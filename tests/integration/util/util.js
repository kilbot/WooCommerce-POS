var baseUrl = 'http://beta.woopos.com.au/pos/';

module.exports = function() {
  var W = this.Widget;

  this.login = function(user, pass) {
    this.driver.get(baseUrl);
    return new W.LoginForm().login(user, pass);
  };

};