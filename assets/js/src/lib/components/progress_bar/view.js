define([
	'app',
	'text!lib/components/progress_bar/template.html',
	'handlebars'
], function(
	POS,
	ProgressBarTmpl,
	Handlebars
){
	
	POS.module('Components.ProgressBar', function(ProgressBar, POS, Backbone, Marionette, $, _){
		
		ProgressBar.View = Marionette.ItemView.extend({
			template: Handlebars.compile( ProgressBarTmpl ),

			modelEvents: {
				'change:progress'	: 'render',
				'progress:complete' : 'deactivate'
			},

			deactivate: function() {
				this.$('.progress-bar').removeClass('active progress-bar-striped');
			}

		});

	});

});