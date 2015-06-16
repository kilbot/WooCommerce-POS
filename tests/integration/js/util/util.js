/** beta site **/
var baseUrl = 'http://beta.woopos.com.au/pos/';
var user = 'demo';
var pass = 'demo';

/* local dev */
if(process.env.LOCAL_DEV){
  var baseUrl = 'http://woopos.dev/pos/';
  var user = 'admin';
  var pass = 'password';
}

module.exports = function() {
  var W = this.Widget;

  this.login = function() {
    this.driver.get(baseUrl);
    return new W.LoginForm().login(user, pass);
  };

};