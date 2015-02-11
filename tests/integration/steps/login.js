module.exports = function(){
  var Widget = this.Widget;

  this.Given(/^I visit the POS$/,function(){
    this.driver.get('http://beta.woopos.com.au/pos/');
  });

  this.When(/^I enter login\/pass as demo\/demo$/, function(){
    new Widget.fill({
      selector: '#user_login',
      value: 'demo'
    });
    new Widget.fill({
        selector: '#user_pass',
        value: 'demo'
    });
    new Widget.click({
        selector: '#wp-submit'
    });
  });

  this.Then(/^I should see the POS$/, function(){
    var POS = Widget.extend({
      root: 'body'
    });
    var pos = new POS();
    pos.isPresent('.products-module').should.eventually.be.true;
    pos.isPresent('.cart-module').should.eventually.be.true;
  })
}