define(['app', 'spin'], function(POS, Spinner){
	
	POS.module('Components.Loading', function(Loading, POS, Backbone, Marionette, $, _){
		
		Loading.LoadingView = Marionette.ItemView.extend({
			template: _.template( '<div id="spinner" style="position:relative"></div>' ),

			onShow: function(){
				console.log(this.$el);
				var opts = this._getOptions();
				var target = document.getElementById('spinner');
				new Spinner(opts).spin(target);
			},

			onClose: function(){
				// this.$el.spin(false);
			},

			_getOptions: function() {
				return {
					// lines: 13, // The number of lines to draw
					// length: 20, // The length of each line
					// width: 10, // The line thickness
					// radius: 30, // The radius of the inner circle
					// corners: 1, // Corner roundness (0..1)
					// rotate: 0, // The rotation offset
					// direction: 1, // 1: clockwise, -1: counterclockwise
					color: '#444', // #rgb or #rrggbb
					// speed: 1, // Rounds per second
					// trail: 60, // Afterglow percentage
					// shadow: false, // Whether to render a shadow
					// hwaccel: false, // Whether to use hardware acceleration
					// className: 'spinner', // The CSS class to assign to the spinner
					// zIndex: 2e9, // The z-index (defaults to 2000000000)
					// top: '30px', // Top position relative to parent in px
					// left: 'auto' // Left position relative to parent in px					
				}
			}

		});

	});

});