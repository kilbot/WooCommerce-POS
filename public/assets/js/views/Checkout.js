define(['underscore', 'backbone', 'handlebars', 'accounting', 'views/Helpers'], 
	function(_, Backbone, Handlebars, accounting) {

	// View for checkout modal
	var Checkout = Backbone.View.extend({		
		className: 'modal fade',
		template: Handlebars.compile( $('#tmpl-checkout').html() ),
		params: pos_params,
		order: {
			is_paid 	: false,
		},

		events: {
			'hidden.bs.modal'		: 'teardown',
			'click .modal-footer'	: 'actions',
			'click #payment-options': 'paymentOptions',
			
			'click #close'		: 'close',
			'click #print'		: 'print',
		},
		
		initialize: function(options) {

			// set the accounting settings
			accounting.settings = this.params.accounting;

			// listen to all buttons
			_(this).bindAll();

			// init with cart and totals
			this.cart = options.cart;
			this.totals = options.totals;

			// render the modal
			this.render();
		},

		actions: function(e) {

			// only interested in button clicks
			if( !$(e.target).is('button') ) { return; }

			// with action- class
			var action = e.target.className.match(/\saction-([a-z_-]+)/);
			if( !action ) { return; }

			switch( action[1] ) {
				case 'close':
					// close the cart, will invoke teardown
					this.$el.modal('hide');
				break;
				case 'paid':
					// disable the button and process the order
					$(e.target).attr('disabled','disabled');
					this.process();
				break;
				case 'print':
					// process the order
					this.print();
				break;
				case 'new-order':
					// clear the cart and hide the model
					_.invoke(this.cart.toArray(), 'destroy');
					this.$el.modal('hide');
				break;
			}
		},

		paymentOptions: function(e) {
			// switch active
			$(e.currentTarget).children('.panel').removeClass('panel-success').addClass('panel-default');
			$(e.target).closest('.panel').removeClass('panel-default').addClass('panel-success');
		},

		process: function() {
			var that = this;

			// pick the data from the cart items we are going to send
			var items = this.cart.map( function( model ) {
				return _.pick( model.toJSON(), ['id', 'qty', 'line_total'] );  
			});

			// send the cart data to the server
			$.post( pos_params.ajax_url , { action: 'pos_process_order', cart: items, order_discount: this.totals.get('order_discount'), note: this.totals.get('note') } )
			.done(function( data ) {
				that.order = data.order;
				that.order.is_paid = true;
				that.render();
			})
			.fail(function( jqXHR, textStatus, errorThrown ) {
				console.log(jqXHR);
			});	
		},

		teardown: function() {
			$('#cart .actions').removeClass('working');
			$('#cart .actions .btn').removeAttr('disabled');
			this.$el.removeData('modal');
			this.remove();
		},

		print: function() {
			
			// prepare page for printing
			this.$el.addClass('print-modal');
			$('#page').hide();
			$('#footer').hide();

			window.print();

			// restore page
			$('#page').show();
			$('#footer').show();
			this.$el.removeClass('print-modal');
			
		},

		render: function() {
			var cart = this.cart.toJSON();
			var totals = this.totals.toJSON();

			// totals check
			if( this.order.is_paid && parseFloat( accounting.formatNumber( this.order.total ) ) !== parseFloat( accounting.formatNumber( totals.total ) ) ) {
				console.log( 'wc: ' + this.order.total + ', pos: ' + totals.total ); //debug
				totals.total_mismatch = true;
			}

			// compile the template
			this.$el.html( this.template({ cart: cart, totals: totals, order: this.order }) );

			// show the modal
			this.$el.modal({ 'show': true, backdrop: 'static' });

			return this;
		},
		
	});
		 
	return Checkout;
});