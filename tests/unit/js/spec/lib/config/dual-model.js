describe('lib/config/dual-model.js', function () {

  beforeEach(function () {
    this.ajaxSync = stub().resolves('hi');
    var DualModel = proxyquire('lib/config/dual-model', {
      './deep-model': Backbone.Model.extend({
        sync: this.ajaxSync
      })
    });
    this.model = new DualModel();
  });

  it('should be in a valid state', function() {
    this.model.should.be.ok;
  });

  it('save with the correct delayed status', function() {
    this.model.save({title: 'Foo'});
  });

});