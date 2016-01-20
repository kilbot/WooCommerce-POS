describe('entities/tax/model.js', function () {

  var Model = require('entities/tax/model');

  it('should be in a valid state', function () {
    var model = new Model();
    expect(model).to.be.ok;
  });

});