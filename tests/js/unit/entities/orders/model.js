describe('entities/orders/model.js', function () {

  beforeEach(function () {

    var Model = require('entities/orders/model');
    this.model = new Model();

  });

  it('should be in a valid state', function() {
    expect(this.model).to.be.ok;
  });

});