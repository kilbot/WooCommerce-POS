describe('entities/gateways/model.js', function () {

  var Gateway = require('entities/gateways/model');

  var settings = {
    active: false,
    icon: 'http://example.com/credit-card.gif',
    method_id: 'example_gateway',
    method_title: 'Example Gateway',
    payment_fields: '<div class="form-group">Hello World</div>',
    params: {
      client_token: '123456789',
      flag: true
    }
  };

  it('should be in a valid state', function() {
    var gateway = new Gateway();
    expect(gateway).to.be.ok;
  });

  it('should parse the gateway settings', function() {
    var gateway = new Gateway(settings);

    // only store necessary data, ie: no need to save templates
    var whitelist = ['active', 'icon', 'method_id', 'method_title'];
    expect( gateway.toJSON() ).eqls( _.pick( settings, whitelist ) );
  });

  it('should have a function to return the payment_fields', function() {
    var gateway = new Gateway(settings);
    expect( gateway.getPaymentFields() ).equals( settings.payment_fields );
  });

  it('should have a function to return the gateway params', function() {
    var gateway = new Gateway(settings);
    expect( gateway.getParams() ).equals( settings.params );
  });

});