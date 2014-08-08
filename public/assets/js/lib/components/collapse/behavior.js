define(['app', 'collapse'], function(POS){
	
	POS.module('Components.Collapse', function(Collapse, POS, Backbone, Marionette, $, _){
	
		Collapse.Behavior = Marionette.Behavior.extend({

			initialize: function(){

			},

			ui: {
				heading: '.panel-heading'
			},

			events: {
				'heading @ui.heading' : 'expandPanel'
			},

			expandPanel: function() {
				
			}

		});

	});

});