/**
 * Test the cart totals calculates correct values based on pos_params.
 * 
 */

define(['jquery', 'underscore', 'backbone', 'accounting', 'collections/CartItems', 'models/CartTotals', 'json!dummy-products' ], 
	function($, _, Backbone, accounting, CartItems, CartTotals, dummy_products) {

	describe("The cart", function() {

		it("should contain the correct number of items", function() {

			c = new CartItems();
			c.add(dummy_products.products);
			expect(c.length).toEqual(3);
		});
	});

	describe("The cart totals", function() {

		beforeEach(function() {

			c = new CartItems();

		});

		it("should be in a valid state", function() {

			c.add(dummy_products.products);
			expect( c.totals.model.isValid() ).toBe(true);
			
		});

		it("should calculate the subtotal", function() {

			// add the products
			c.add(dummy_products.products);
			expect( c.totals.model.get('subtotal') ).toEqual('&#36;43.00');
			console.log(c.totals.model);
		});

		it("should calculate the total", function() {

			// add the products
			c.add(dummy_products.products);
			expect( c.totals.model.get('total') ).toEqual('&#36;43.00');
			console.log(c.totals.model);
		});

		it("should calculate the cart discount", function() {

			// add the products
			c.add(dummy_products.products);

			// change the price
			var woo_single = c.get(99);
			woo_single.set( {'qty': 3, 'display_price': '1.50'} );

			expect( c.totals.model.get('cart_discount') ).toEqual('- &#36;1.50');
			console.log(c.totals.model);
		});

		// it("should add another row for Tax", function() {

		// 	// mock user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	// pos_params.wc.prices_include_tax = 'no';
		// 	// pos_params.wc.tax_display_cart = 'excl';

		// 	// add the products
		// 	CartItems.add(dummy_products.products);

		// 	// change the price
		// 	var woo_single = CartItems.get(99);
		// 	woo_single.set( {'display_price': '1.50'} );

		// 	expect(c.length).toEqual(4);
		// });

		// it("should also add rows for Itemized Tax", function() {

		// 	// mock user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	pos_params.wc.tax_total_display = 'itemized';

		// 	// add the products
		// 	CartItems.add(dummy_products.products);

		// 	// change the price
		// 	var woo_single = CartItems.get(99);
		// 	woo_single.set( {'display_price': '1.50'} );

		// 	expect(c.length).toEqual(4);
		// });



	});

});