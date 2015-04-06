describe('lib/utilities/utils.js', function(){

  var Utils = require('lib/utilities/utils');

  describe('round(num, precision)', function(){

    it('TODO: should round to the nearest even number (bankers rounding)?', function(){
      var rounded = Utils.round(27.45, 1);
      // should be 27.4??
      // expect(rounded).equals(27.4);
      expect(rounded).equals(27.5);
    });

  });

});