describe('apps/app/application.js', function() {

  beforeEach(function() {
    this.layoutView = { render: stub() };
    this.LayoutView = stub().returns(this.layoutView);

    this.Controller = proxyquire('apps/app/application.js', {
      'lib/utilities/debug': stub(),
      './layout-view': this.LayoutView
    });

    this.module = new this.Controller();
  });

  describe('#initialize', function() {
    beforeEach(function() {
      this.module.initialize();
    });

    it('should create a layout', function() {
      expect(this.LayoutView).to.have.been.calledWithNew;
      expect(this.module).to.have.property('layout', this.layout);
    });
  });

});