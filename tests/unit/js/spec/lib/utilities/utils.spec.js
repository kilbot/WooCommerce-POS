describe('lib/utilities/utils.js', function(){

  var Utils = require('lib/utilities/utils');

  describe('round(num, precision)', function(){

    it('TODO: round to the nearest even number (bankers rounding)?', function(){
      // Issue suggests this should be 22.34
      // https://github.com/kilbot/WooCommerce-POS/issues/79
      var rounded = Utils.round(22.345, 2);
      expect(rounded).equals(22.35);

      var even_rounded = Utils.round( 22.345, 2, 'PHP_ROUND_HALF_EVEN' );
      expect(even_rounded).equals(22.34);
    });

  });

});