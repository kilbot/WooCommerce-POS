define([
	'app',
	'hbs!lib/components/progress_bar/template'
], function(
	POS,
	ProgressBarTmpl
){
	
	POS.module('Components.ProgressBar', function(ProgressBar, POS, Backbone, Marionette, $, _){

		ProgressBar.Model = Backbone.Model.extend({
			defaults: {
				min: 0,
				max: 100,
				progress: 0
			},

			initialize: function() {
				this.on( 'change:progress', this._updatePercentage );
			},

			_updatePercentage: function(e){
				this.percentage = ( this.progress / ( this.max - this.min ) ) * 100;
			}
		});

		
		ProgressBar.View = Marionette.ItemView.extend({
			tagName: 'div',
			template: ProgressBarTmpl,
			className: 'progress',

			initialize: function(options) {
				this.model = new ProgressBar.Model(options);
			},
		});


		POS.reqres.setHandler( 'show:progress', function(options) {
			return new ProgressBar.View(options)
		});

	});

});