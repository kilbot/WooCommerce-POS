define(['app', 'spin'], function(POS, Spinner){
	
	POS.module('Common.Views', function(Views, POS, Backbone, Marionette, $, _){
		
		Views.Loading = Marionette.ItemView.extend({
			template: _.template( '<div id="spinner" style="position:relative"></div>' ),

			onShow: function(){
				var opts = {
					// lines: 13, // The number of lines to draw
					// length: 20, // The length of each line
					// width: 10, // The line thickness
					// radius: 30, // The radius of the inner circle
					// corners: 1, // Corner roundness (0..1)
					// rotate: 0, // The rotation offset
					// direction: 1, // 1: clockwise, -1: counterclockwise
					// color: '#000', // #rgb or #rrggbb
					// speed: 1, // Rounds per second
					// trail: 60, // Afterglow percentage
					// shadow: false, // Whether to render a shadow
					// hwaccel: false, // Whether to use hardware acceleration
					// className: 'spinner', // The CSS class to assign to the spinner
					// zIndex: 2e9, // The z-index (defaults to 2000000000)
					// top: '30px', // Top position relative to parent in px
					// left: 'auto' // Left position relative to parent in px
				};
				// console.log(this.el);
				var target = document.getElementById('spinner');
				new Spinner(opts).spin(target);
			}
		});


		Views.Numpad = Marionette.ItemView.extend({
			template : _.template('<% _.each(keys, function(key){ %><button><%= key %></button><% }); %>'),

			serializeData: function(){
				return { keys: this.standardKeys };
			},

			standardKeys: [
				'1', '2', '3', 'del',
				'4', '5', '6', '+/-',
				'7', '8', '9', '%',
				'0', '00', '.', 'ret'
			],

			events: {
				'click button' 	: 'btnPress',
			},

			keyEvents: {
				'x': 'onXPress',
			},

			btnPress: function(e){
				console.log( $(e.target).text() );
			},

			// onRender: function() {
			// 	// HotKeys.bind(this.keyEvents, this, this.cid);
				
			// 	this.$el.html( this.template({ key: 'hello!' }) );
			// },

			onXPress: function() {
				console.log('x was pressed');
			}

		});

	});

	return POS.Common.Views;
});