define(['app', 'apps/cart/totals/totals_view'], function(POS, View){

	POS.module('CartApp.Totals', function(Totals, POS, Backbone, Marionette, $, _){

		Totals.Controller = {
			showTotals: function(){
				require(['entities/cart'], function(){

					// get cart totals
					

				});
			}
		};
	});

	return POS.CartApp.Totals.Controller;
});