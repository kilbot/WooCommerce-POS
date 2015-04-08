module.exports = function() {
  var Widget = this.Widget || {};

  Widget.LoginForm = Widget.extend({
    root: '#login',
    login: function(user, pass){
      this.fill({
        selector: '#user_login',
        value: user
      });
      this.fill({
        selector: '#user_pass',
        value: pass
      });
      return this.click('#wp-submit');
    }
  });

};