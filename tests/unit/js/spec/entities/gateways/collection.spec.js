describe('entities/gateways/collection.js', function () {

  var Gateways = require('entities/gateways/collection');

  var gateway_settings = [{
    active: false,
    method_id: 'inactive_gateway'
  }, {
    active: true,
    method_id: 'active_gateway'
  }];

  it('should be in a valid state', function() {
    var gateways = new Gateways();
    expect(gateways).to.be.ok;
  });

  it('should return the active gateway', function() {
    var gateways = new Gateways(gateway_settings);
    expect( gateways.getActiveGateway()).to.be.instanceof( Backbone.Model );
  });

  it('should return the active gateway payment details', function() {
    var gateways = new Gateways(gateway_settings);
    expect( gateways.getPaymentDetails() ).eqls( gateway_settings[1] );
  });

});