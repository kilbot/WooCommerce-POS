describe('lib/config/dual-model.js', function () {

  var Model = require('lib/config/dual-model');

  it('should be in a valid state', function() {
    var model = new Model();
    model.should.be.ok;
  });

  it('should have a \'isDelayed\' method', function() {

    var model = new Model({}, {
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