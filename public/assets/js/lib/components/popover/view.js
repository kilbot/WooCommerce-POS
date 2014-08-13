define([
	'app',
	'popover'
], function(
	POS
){
	
	POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){
	
		Popover.View = Marionette.LayoutView.extend({
			template: _.template('<div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div>'),
			className: 'popover',
			attributes: {
				'role' : 'tooltip'
			},

			regions: {
				content : '.popover-content'
			},

			initialize: function (options) {
				if( _(options).has('popoverTmpl') ) this.template = _.template( options.popoverTmpl );
				this.target = options.target;

				// popover events come from the target element
				var self = this;
				this.target.on( 'show.bs.popover', function() { self.trigger('show:popover') });
				this.target.on( 'shown.bs.popover', function() { self.trigger('after:show:popover') });
				this.target.on( 'hide.bs.popover', function() { self.trigger('hide:popover') });
				this.target.on( 'hidden.bs.popover', function() { self.trigger('after:hide:popover') });

				// popover options
				this.popoverOpts = _.clone(options) || {};
				_.defaults(this.popoverOpts, {
					html: true,
					container: 'body',
					trigger: 'manual',
					template: this.el
				});

				// popover needs this.el
				this.render();

			},

			openPopover: function (options) {
				this.once('show:popover', options.onShowPopover );
				this.once('after:show:popover', options.onAfterShowPopover);
				this.setupPopover(options);
				this.target.popover('show');
			},

			closePopover: function (options) {
				this.once('hide:popover', options.onHidePopover);
				this.once('after:hide:popover', options.onAfterHidePopover);
				this.once('after:hide:popover', this.teardownPopover);
				this.target.popover('hide');
			},

			setupPopover: function (options) {
				this.target.popover(this.popoverOpts);
			},

			teardownPopover: function () {
				this.content.empty();
			}
			
		});

	});

});