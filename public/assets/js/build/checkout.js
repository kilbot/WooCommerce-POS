/**
 * Order UI
 */

(function ( $ ) {
	"use strict";

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	} else {
		accounting.settings = pos_cart_params.accounting.settings;
		var wc = pos_cart_params.wc;
	}

	/*============================================================================
	 The Receipt
	 ===========================================================================*/
	var Order = Backbone.Model.extend({});

	var Receipt = Backbone.View.extend({
		model: Order,
		tagName: 'table',
		item_template: _.template('<tr><td><%= name %></td><td><%= quantity %></td><td><%= total %></td></tr>'),
		total_template: _.template('<tr><th colspan="2"><%= label %></th><td><%= total %></td></tr>'),

		initialize: function() {

		},

		render: function() {
			var order = this.model.toJSON();

			// remove padding from modal-content
			this.$el.parent('div').css('padding',0);

			// insert a table
			this.$el.append('<thead><tr><th>Product</th><th>Qty</th><th>Price</th></thead><tbody></tbody><tfoot></tfoot>');

			// Loop through the cart items
			_.each( order.line_items, function( item ){

				if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {

					item.total = accounting.formatMoney( parseFloat(item.total) + parseFloat(item.total_tax) );
				} else {
					item.total = accounting.formatMoney( parseFloat(item.total) );
				}

				this.$el.find('tbody').append( this.item_template( item ) );
			}, this);

			// subtotal
			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {
				this.$el.find('tfoot').append( this.total_template( { label: 'Subtotal:', total: accounting.formatMoney( parseFloat(order.total) ) } ) );
			} else {
				this.$el.find('tfoot').append( this.total_template( { label: 'Subtotal:', total: accounting.formatMoney( parseFloat(order.subtotal) ) } ) );
			}
			

			// discount
			if( parseFloat(order.cart_discount) !== 0 ) {

				this.$el.find('tfoot').append( this.total_template( { label: 'Cart Discount:', total: accounting.formatMoney( parseFloat(order.cart_discount) * -1 ) } ) );		
			}

			// taxes
			if( parseFloat(order.total_tax) !== 0) {

				// if tax should be itemized
				if( wc.tax_total_display === 'itemized' ) {

					// Loop through the tax lines
					_.each( order.tax_lines, function( tax ){
						this.$el.find('tfoot').append( this.total_template( { label: 'Tax (' + tax.title + ')', total: accounting.formatMoney( parseFloat(tax.total) ) } ) );
					}, this);
				}

				// else just the one
				else {
					this.$el.find('tfoot').append( this.total_template( { label: 'Tax:', total: accounting.formatMoney( parseFloat(order.total_tax) ) } ) );
				}
			}

			// total
			this.$el.find('tfoot').append( this.total_template( { label: 'Total:', total: accounting.formatMoney( parseFloat(order.total) ) } ) );

			return this;
		},

	});

	/*============================================================================
	 Mediator
	 ===========================================================================*/ 

	// subscribe to addToCart from the product list
	mediator.subscribe('checkout', function( cartCollection, totalsCollection ){

		// pick the data from the cartCollection we are going to send
		var items = cartCollection.map(function(model) {
    		return _.pick(model.toJSON(), ['id','qty','price','discount','total','total_discount']);  
		});

		// send the cart data to the server
		$.post( pos_cart_params.ajax_url , { action: 'pos_process_order', cart: items } )
		.done(function( data ) {
			var modal = new Backbone.BootstrapModal({
				content: new Receipt({ model: new Order(data.order) }),
				// title: 'Order: ' + data.order.order_number,
				// okText: 'New Order',
				// cancelText: false,
				// allowCancel: false,
				template: _.template('\
					<div class="modal-dialog"><div class="modal-content">\
					<div class="modal-header"><h4>Order ' + data.order.order_number + '</h4></div>\
					<div class="modal-body" style="padding:0">{{content}}</div>\
					<div class="modal-footer"><a href="#" class="btn ok btn-primary">New Order</a></div>\
					</div></div>\
				'),
			}).open();
		})
		.fail(function( jqXHR, textStatus, errorThrown ) {
			console.log(jqXHR);
		});

	});

}(jQuery));