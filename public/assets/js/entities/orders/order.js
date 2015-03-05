define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Order = Backbone.Model.extend({
			urlRoot: pos_params.wc_api_url + 'orders/',
			defaults: {
				status: 'pending',
				pos: 1 // TODO: add ?pos=1 to all server requests instead?
			},

			sync: Backbone.ajaxSync,

			parse: function (resp, options) {
				if( resp.order ) {
					return resp.order;
				}
				else {
					return resp;
				}			
			},

			create: function(items, totals) {

				// pick required data from total
				var order = _.pick( totals.toJSON(), [
					'total',
					'cart_discount',
					'order_discount',
					'customer_id',
					'total_tax',
					'note',
					'itemized_tax'
				]);

				// pick required data from the cart items, 
				// and map to property names required by WC API
				order.line_items = items.map( function( model ) {
					var item = {
						product_id 	: model.get('id'),
						quantity 	: model.get('qty'),
						subtotal_tax: model.get('line_subtotal_tax'),
						subtotal 	: model.get('line_subtotal'),
						total_tax	: model.get('line_tax'),
						total 		: model.get('line_total'),
						tax_data 	: this._format_tax_data( model.get('tax_rates'), model.get('qty') )
					}
					return item;
				}, this);

				// create order
				this.set(order);
			},

			process: function( gateway_data ){

				this.set({ gateway_data: gateway_data });
				this.save();
				return;

				// combine total model with checkout form data
				var order = _.assign( this.toJSON(), gateway_data);

				// add ajax info
				var data = _.assign( order, {
					action 	: 'pos_process_order',
					security: pos_params.nonce,
					pos 	: 1
				});

				// send the cart data to the server
				var self = this;
				$.post( pos_params.ajax_url, data )
				.done(function( data ) {
					if(POS.debug) console.log(data);
					self.trigger('processing:complete', data);
				})
				.fail(function( jqXHR, textStatus, errorThrown ) {
					if(POS.debug) console.warn('error processing payment');
				});

			},

			// WC API v2
			_format_tax_data: function( rates, qty ) {
				var tax_data = {
					total: {},
					subtotal: {}
				};

				_(rates).each( function(rate, key) {
					tax_data.total[key] = rate.tax_amount;
					tax_data.subtotal[key] = POS.round( rate.subtotal_tax * qty, 4 );
				});

				return tax_data;
			}

		});

	});

	return POS.Entities.Order;
});