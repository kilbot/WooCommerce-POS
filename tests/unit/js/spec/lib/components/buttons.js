describe('lib/components/buttons/behavior.js', function () {

  beforeEach(function () {

    //var tmpl = fs.readFileSync(
    //  require.resolve('/lib/components/buttons/buttons.hbs')
    //);
    var Buttons = proxyquire('lib/components/buttons/view',{
      './buttons.hbs': 'hbs file'
    });
    this.view = new Buttons();
    this.view.render();

  });

  it('should be in a valid state', function() {
    expect(this.view).to.be.ok;
  });

  //it('should trigger an action:event on button click', function() {
  //  var method = stub();
  //  this.view.on('action:test', method);
  //  this.view.$('[data-action="test"]').trigger('click');
  //  expect(method).to.have.been.calledOnce;
  //});

});