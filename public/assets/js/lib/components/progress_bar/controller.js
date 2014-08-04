define([
	'app',
	'lib/components/progress_bar/entities',
	'lib/components/progress_bar/view'
], function(
	POS
){

	POS.module('Components.ProgressBar', function(ProgressBar, POS, Backbone, Marionette, $, _){

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