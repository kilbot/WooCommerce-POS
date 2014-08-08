define([
	'app', 
	'lib/components/popover/view',
	'lib/components/popover/behavior'
], function(
	POS
){

	POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){

		Popover.Controller = Marionette.Controller.extend({

			initialize: function (options) {
				_.bindAll(this, 'openPopover', 'closePopover');
				Popover.channel.comply('open', this.openPopover);
				Popover.channel.comply('close', this.closePopover);
			},

			openPopover: function (options) {
				this.view = new Popover.View(options);
				this.view.openPopover(options);
			},

			closePopover: function (options) {
				this.view.closePopover(options);
			},

		});

	});

});