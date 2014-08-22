define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Order = Backbone.Model.extend({
			urlRoot: pos_params.wc_api_url + 'orders/',
			defaults: {
				status: 'pending'
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
					'note'
				]);

				// pick required data from the cart items, 
				// and map to property names required by WC API
				order.line_items = items.map( function( model ) {
					var item = {
						product_id 	: model.get('id'),
						quantity 	: model.get('qty'),
						subtotal_tax: model.get('subtotal_tax'),
						subtotal 	: model.get('subtotal'),
						total_tax	: model.get('line_tax'),
						total 		: model.get('line_total'),
						itemized_tax: model.get('tax_rates')
					}
					return item;
				});

				// create order
				this.set(order);
			},

			process: function( gateway_data ){

				// combine total model with checkout form data
				var order = _.assign( this.toJSON(), gateway_data);

				// add ajax info
				var data = _.assign( order, {
					action 	: 'pos_process_order',
					security: pos_params.nonce
				});

				// send the cart data to the server
				var self = this;
				$.post( pos_params.ajax_url, data )
				.done(function( data ) {
					if(POS.debug) console.log(data);

					if( _.isObject(data) ) {
						self.set(data);
					} else {
						self.set({
							status: 'failure',
							message: data
						});
					}

				})
				.fail(function( jqXHR, textStatus, errorThrown ) {
					if(POS.debug) console.warn('error processing payment');
				});

			},

		});

	});

	return POS.Entities.Order;
});


// http://woothemes.github.io/woocommerce/rest-api/#get-orders-id
// {
//   "order" : {
//     "completed_at" : "2013-12-10T18:59:30Z",
//     "tax_lines" : [],
//     "status" : "processing",
//     "total" : "20.00",
//     "cart_discount" : "0.00",
//     "customer_ip" : "127.0.0.1",
//     "total_discount" : "0.00",
//     "updated_at" : "2013-12-10T18:59:30Z",
//     "currency" : "USD",
//     "total_shipping" : "0.00",
//     "customer_user_agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
//     "line_items" : [
//       {
//         "product_id" : 31,
//         "quantity" : 1,
//         "id" : 7,
//         "subtotal" : "20.00",
//         "tax_class" : null,
//         "sku" : "",
//         "total" : "20.00",
//         "name" : "Ninja Silhouette",
//         "total_tax" : "0.00"
//       }
//     ],
//     "customer_id" : "4",
//     "total_tax" : "0.00",
//     "order_number" : "#113",
//     "shipping_methods" : "Free Shipping",
//     "shipping_address" : {
//       "city" : "New York",
//       "country" : "US",
//       "address_1" : "512 First Avenue",
//       "last_name" : "Draper",
//       "company" : "SDCP",
//       "postcode" : "12534",
//       "address_2" : "",
//       "state" : "NY",
//       "first_name" : "Don"
//     },
//     "payment_details" : {
//       "method_title" : "Cheque Payment",
//       "method_id" : "cheque",
//       "paid" : false
//     },
//     "id" : 113,
//     "shipping_tax" : "0.00",
//     "cart_tax" : "0.00",
//     "fee_lines" : [],
//     "total_line_items_quantity" : 1,
//     "shipping_lines" : [
//       {
//         "method_title" : "Free Shipping",
//         "id" : 8,
//         "method_id" : "free_shipping",
//         "total" : "0.00"
//       }
//     ],
//     "customer" : {
//       "id" : 4,
//       "last_order_date" : "2013-12-10T18:58:00Z",
//       "avatar_url" : "https://secure.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=96",
//       "total_spent" : "0.00",
//       "created_at" : "2013-12-10T18:58:07Z",
//       "orders_count" : 0,
//       "billing_address" : {
//         "phone" : "215-523-4132",
//         "city" : "New York",
//         "country" : "US",
//         "address_1" : "512 First Avenue",
//         "last_name" : "Draper",
//         "company" : "SDCP",
//         "postcode" : "12534",
//         "email" : "thedon@mailinator.com",
//         "address_2" : "",
//         "state" : "NY",
//         "first_name" : "Don"
//       },
//       "shipping_address" : {
//         "city" : "New York",
//         "country" : "US",
//         "address_1" : "512 First Avenue",
//         "last_name" : "Draper",
//         "company" : "SDCP",
//         "postcode" : "12534",
//         "address_2" : "",
//         "state" : "NY",
//         "first_name" : "Don"
//       },
//       "first_name" : "Don",
//       "username" : "thedon",
//       "last_name" : "Draper",
//       "last_order_id" : "113",
//       "email" : "thedon@mailinator.com"
//     },
//     "note" : "",
//     "coupon_lines" : [],
//     "order_discount" : "0.00",
//     "created_at" : "2013-12-10T18:58:00Z",
//     "view_order_url" : "https://www.example.com/my-account/view-order/113",
//     "billing_address" : {
//       "phone" : "215-523-4132",
//       "city" : "New York",
//       "country" : "US",
//       "address_1" : "512 First Avenue",
//       "last_name" : "Draper",
//       "company" : "SDCP",
//       "postcode" : "12534",
//       "email" : "thedon@mailinator.com",
//       "address_2" : "",
//       "state" : "NY",
//       "first_name" : "Don"
//     }
//   }
// }