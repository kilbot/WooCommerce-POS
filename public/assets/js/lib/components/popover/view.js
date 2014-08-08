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

				this.popoverOpts = _.clone(options) || {};
				_.defaults(this.popoverOpts, {
					placement: 'bottom',
					html: true,
					trigger: 'manual',
					container: 'body',
					template: this.el
				});

				var self = this;
				this.target.on( 'show.bs.popover', function(){
					self.trigger('show:popover');
				});
				this.target.on( 'shown.bs.popover', function(){
					self.trigger('after:show:popover');
					self.showContent(options);
				});
				this.target.on( 'hide.bs.popover', function(){
					self.trigger('hide:popover');
				});
				this.target.on( 'hidden.bs.popover', function(){
					self.trigger('after:hide:popover');
				});

				this.render();

				// TODO: fix this hack!
				this.$el.find('.popover-content').width(options.width);
			},

			openPopover: function (options) {
				this.once('after:show:popover', options.callback);
				this.setupPopover(options);
				this.target.popover('show');
			},

			closePopover: function (options) {
				this.once('after:hide:popover', options.callback);
				this.once('after:hide:popover', this.teardownModal);
				this.target.popover('hide');
			},

			setupPopover: function (options) {
				if (this.isShown) this.teardownModal();
				this.target.popover(this.popoverOpts);
				this.isShown = true;
			},

			showContent: function(options) {
				this.content.show(options.view);
			},

			teardownPopover: function () {
				if (!this.isShown) return;
				this.content.empty();
				this.isShown = false;
			}
			
		});

	});

});