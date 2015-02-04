describe('lib/components/buttons/behavior.js', function () {

  beforeEach(function () {

    var Buttons = require('lib/components/buttons/behavior');
    var View = Backbone.Marionette.View.extend({
      behaviors: {
        Buttons: {
          behaviorClass: Buttons
        }
      }
    });
    this.view = new View();
    this.view.render();
    this.view.$el.append('' +
      '<button data-action="test">Test</button>' +
      '<button data-action="another">Another</button>' +
      '<p class="response"></p>'
    );

  });

  it('should be in a valid state', function() {
    expect(this.view).to.be.ok;
  });

  it('should trigger an action:event on button click', function() {
    var method = stub();
    this.view.on('action:test', method);
    this.view.$('[data-action="test"]').trigger('click');
    expect(method).to.have.been.calledOnce;
  });

});