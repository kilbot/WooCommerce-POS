define(['underscore', 'backbone', 'accounting', 'bootstrap-modal'], 
	function(_, Backbone, accounting) {
	var BaseModalView = Backbone.View.extend({		
		className: 'modal fade',
		template: _.template( $('#tmpl-order').html() ),
		totalsTemplate: _.template($('#tmpl-order-total').html()),

		events: {
			'hidden.bs.modal'	: 'teardown',
			'click #close'		: 'close',
			'click #print'		: 'print',
		},
		
		initialize: function(options) {

			// listen
			_(this).bindAll();

			// init with cart and totals
			this.cart = options.cart;
			this.totals = options.totals;
			
		},

		process: function(items) {
			var that = this;

			// send the cart data to the server
			$.post( pos_params.ajax_url , { action: 'pos_process_order', cart: items } )
			.done(function( data ) {
				that.order = data.order;
				that.render();
			})
			.fail(function( jqXHR, textStatus, errorThrown ) {
				console.log(jqXHR);
			});			
		},

		teardown: function() {
			this.$el.removeData('modal');
			this.remove();
		},

		close: function() {

			// clear cart and teardown
			_.invoke(this.cart.toArray(), 'destroy');
			this.$el.modal('hide');

		},

		print: function() {
			
			// prepare page for printing
			this.$el.addClass('print-modal');
			$('#page').hide();

			window.print();

			// restore page
			$('#page').show();
			this.$el.removeClass('print-modal');
			
		},

		render: function() {
			var cart = this.cart.toJSON();
			var order_id = this.order.id;

			// format display price
			_(cart).each(function(item) {
				item.display_price = accounting.formatMoney( item.display_price );
			});

			this.$el.html( this.template({ 'order_id': order_id, 'cart': cart }) );

			// append totals
			var totals = this.totals.toJSON();
			
			// totals check
			console.log( 'wc: ' + this.order.total + ', pos: ' + this.totals.get('total_check') ); //debug
			if( parseFloat( this.order.total ) !== parseFloat( this.totals.get('total_check') ) ) {
				totals.total_mismatch = true;
			}

			this.$el.find('tfoot').html( this.totalsTemplate( totals ) );		

			// now show the modal
			this.$el.modal({ 'show': true, backdrop: 'static' });
			$('#cart .actions').removeClass('working');
			return this;
		},
		
	});
		 
	return BaseModalView;
});