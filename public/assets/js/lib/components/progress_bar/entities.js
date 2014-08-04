define(['app'], function(POS){
	
	POS.module('Components.ProgressBar', function(ProgressBar, POS, Backbone, Marionette, $, _){

		ProgressBar.Model = Backbone.Model.extend({
			defaults: {
				min: 0,
				max: 100,
				progress: 0,
				percentage: 0,
				display: 'percentage'
			},

			initialize: function() {
				this.listenTo( POS.vent, 'update:progress', this._updatePercentage );
			},

			_updatePercentage: function( progress ){
				var percentage = ( progress / ( this.get( 'max' ) - this.get( 'min' ) ) ) * 100;
				if(POS.debug) console.log('[notice] Progress: ' + percentage + '%' );

				this.set({
					progress: progress,
					percentage: percentage
				});

				if( progress === this.get( 'max' ) ) {
					this.trigger('progress:complete');
				}
			}
		});

	});

});