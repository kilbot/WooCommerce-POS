define([
	'app',
	'popover'
], function(
	POS
){
	
	POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){
	
		Popover.View = Marionette.LayoutView.extend({
			template: _.template('<div class="arrow"></div><div class="popover-content"></div>'),
			className: 'popover numpad-popover',
			attributes: {
				'role' : 'textbox'
			},

			regions: {
				content: '.popover-content'
			},

			initialize: function (options) {
				this.target = options.target;

				// remove any open popovers
				if( $('.popover').length > 0 ) {
					$('.popover').each( function() {
						$(this).popover('hide');
					});
				}

				this.popoverOpts = _.clone(options) || {};
				_.defaults(this.popoverOpts, {
					placement: 'bottom',
					html: true,
					trigger: 'manual',
					container: 'body',
					template: this.el
				});

				var self = this;
				this.target.on( 'shown.bs.popover', function(){
					self.trigger('after:show:popover');
				});
				this.target.on( 'shown.bs.popover', function(){
					self.trigger('after:show:popover');
				});
				this.target.on( 'hide.bs.popover', function(){
					self.trigger('hide:popover');
				});
				this.target.on( 'hidden.bs.popover', function(){
					self.trigger('after:hide:popover');
				});
			},

			openPopover: function (options) {
				this.once('after:show:popover', options.callback);
				this.setupPopover(options);
				this.target.popover('show');
			},

			closePopover: function (options) {
				this.once('after:hide:popover', options.callback);
				this.once('after:hide:popover', this.teardownPopover);
				this.target.popover('hide');
			},

			setupPopover: function (options) {
				// so much hack
				this.render();
				this.target.popover(this.popoverOpts);
				var thisPopover = this.target.data('bs.popover');
				this.content.show(options.view);

				// prevent setContent method from emptying .popover-content
				thisPopover.__proto__.setContent = function() {}; 
			},

			teardownPopover: function () {
				this.content.empty();
			}
			
		});

	});

});