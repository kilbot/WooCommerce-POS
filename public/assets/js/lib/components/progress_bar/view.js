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
			tagName: 'div',
			template: Handlebars.compile( ProgressBarTmpl ),
			className: 'progress',

			modelEvents: {
				'change:progress'	: 'render'
			}

		});

	});

});