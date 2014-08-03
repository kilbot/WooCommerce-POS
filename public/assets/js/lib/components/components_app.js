define([
	'app',
	'lib/components/loading/controller',
	'lib/components/modal/controller',
	'lib/components/progress_bar/view',
	'lib/components/tabs/controller',
], function(
	POS
){
	
	POS.module('Components', function(Components, POS, Backbone, Marionette, $, _){

		// channels
		Components.Modal.channel = new Backbone.Wreqr.Channel('modal');

		Components.Modal.controller = new Components.Modal.Controller({
			container: POS.modalRegion
		});

		POS.commands.setHandler( 'show:modal', function( template, data ) {
			Components.Modal.controller.getModal( template, data );
		});

		POS.commands.setHandler( 'show:tabs', function(region, entities) {
			return new Components.Tabs.Controller({
				region: region,
				entities: entities
			})
		});

	});

});