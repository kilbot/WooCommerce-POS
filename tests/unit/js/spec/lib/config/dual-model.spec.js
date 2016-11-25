describe('Dual Models', function () {

  var Model = require('lib/config/model');
  var DualModel = Model.extend({
    extends: ['dual']
  });

  it('should be in a valid state', function() {
    var model = new DualModel();
    model.should.be.ok;
  });

  it('should have a \'isDelayed\' method', function() {

    var model = new DualModel({}, {
      collection: {
        states: {
          'update' : 'UPDATE_FAILED',
          'create' : 'CREATE_FAILED',
          'delete' : 'DELETE_FAILED'
        }
      }
    });

    expect( model.isDelayed() ).to.be.false;

    model.set({ _state: 'CREATE_FAILED' });
    expect( model.isDelayed() ).to.be.true;

  });

});