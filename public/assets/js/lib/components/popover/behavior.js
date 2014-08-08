define(['app'], function(POS){
	
	POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){
	
		Popover.Behavior = Marionette.Behavior.extend({

			initialize: function () {
				this.listenToOnce(this.view, 'popover:open', this.openPopover);
			},

			openPopover: function (options) {
				Popover.channel.command('open', _.defaults( options, { view: this.view } ) );
				this.listenToOnce(this.view, 'popover:close', this.closePopover);
			},

			closePopover: function (callback) {
				Popover.channel.command('close', {
					callback: callback
				});
			}

		});

	});

});

