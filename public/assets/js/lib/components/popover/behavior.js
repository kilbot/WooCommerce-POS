define(['app'], function(POS){
	
	POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){
	
		Popover.Behavior = Marionette.Behavior.extend({

			initialize: function (options) {
				this.listenTo(this.view, 'popover:open', this.openPopover);
			},

			openPopover: function (options) {
				options || (options = {});
				this.target = options.target;

				Popover.channel.command('open', options);

				this.listenTo(this.view, 'popover:close', this.closePopover);
			},

			closePopover: function (options) {
				options || (options = {});

				if( !_(options).has('target') ) options.target = this.target;
				
				Popover.channel.command('close', options);
			}

		});

	});

});