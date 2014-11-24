define([
	'app',
	'lib/components/progress_bar/entities',
	'lib/components/progress_bar/view'
], function(
	POS
){

	POS.module('Components.ProgressBar', function(ProgressBar, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		ProgressBar.channel = Backbone.Radio.channel('progress_bar');
		
		ProgressBar.channel.reply( 'get:progressbar', function(options) {
			var controller = new ProgressBar.Controller();
			return controller.getProgressBarView(options);
		});

		/**
		 * Controller
		 */
		ProgressBar.Controller = Marionette.Controller.extend({

			getProgressBarView: function(options) {

				var model = new ProgressBar.Model();
				options = _.defaults(options, { model: model });

				var view = new ProgressBar.View(options);
				return view;
			}

		});

	});

});