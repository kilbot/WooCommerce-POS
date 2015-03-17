describe('lib/config/dual-model.js', function () {

  beforeEach(function () {
    var DualModel = require('lib/config/dual-model');
    this.model = new DualModel();
  });

  describe('new DualModel', function () {
    it('should be in a valid state', function() {
      expect(this.model).to.be.ok;
    });
  });

  describe('method', function () {

  });

});