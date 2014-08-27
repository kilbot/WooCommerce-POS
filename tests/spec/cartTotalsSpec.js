/**
 * Test the cart totals calculates correct values based on pos_params.
 * 
 * Params:
 * calc_taxes
 * prices_include_tax
 * tax_display_cart
 * tax_round_at_subtotal
 * tax_total_display
 *
 * Properties:
 * {string} subtotal
 * {string} cart_discount
 * {string} tax
 * {string} total
 * {bool} show_discount
 * {bool} show_tax
 * {object} tax_labels
 * {object} itemized_tax
 * 
 */

define(['jquery', 'underscore', 'backbone', 'accounting', 'collections/CartItems', 'models/CartTotals', 'json!dummy-products', 'helpers' ], 
	function($, _, Backbone, accounting, CartItems, CartTotals, dummy_products) {

	describe("The cart", function() {

		it("should contain the correct number of items", function() {

			// reset pos_params
			pos_params.wc.calc_taxes = 'no';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';
			pos_params.wc.tax_round_at_subtotal = 'no';
			pos_params.wc.tax_total_display = 'single';

			// init the collection of cart items
			c = new CartItems();

			// add the products
			c.add(dummy_products.products);
			expect(c.length).toEqual(3);
		});
	});

	describe("The cart totals", function() {

		beforeEach(function() {

			// reset pos_params
			pos_params.wc.calc_taxes = 'no';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';
			pos_params.wc.tax_round_at_subtotal = 'no';
			pos_params.wc.tax_total_display = 'single';

			// init the collection of cart items
			c = new CartItems();

			// add the products
			c.add(dummy_products.products);
		});

		it("should be in a valid state", function() {

			expect( c.totals.model.isValid() ).toBe(true);
			
		});

		it("should calculate the subtotal", function() {

			expect( c.totals.model.get('subtotal') ).toEqual('&#36;43.00');
		});

		it("should calculate the total", function() {

			expect( c.totals.model.get('total') ).toEqual('&#36;43.00');
		});

		it("should calculate the cart discount", function() {

			// change the price
			c.get(99).set({ 'qty': 3, 'display_price': '1.50'});

			expect( c.totals.model.get('show_discount') ).toEqual(true);
			expect( c.totals.model.get('cart_discount') ).toEqual('- &#36;1.50');
		});

		it("should calculate the cart tax", function() {

			// change the pos_params
			pos_params.wc.calc_taxes = 'yes';
			c.each( function(product) { product.trigger('change:qty') });

			expect( c.totals.model.get('show_tax') ).toEqual(true);
			expect( c.totals.model.get('tax') ).toEqual('&#36;0.96');
		});

		it("should calculate the itemized taxes", function() {

			// change the pos_params
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.tax_total_display = 'itemized';
			c.get(99).set({ 'taxable': true });
			c.each( function(product) { product.trigger('change:qty') });

			var itemized_tax = c.totals.model.get('itemized_tax');

			expect( c.totals.model.get('show_itemized') ).toEqual(true);
			expect( _.isPlainObject(itemized_tax) ).toBe(true);
			expect( _.isEmpty(itemized_tax) ).toBe(false);
		});


	});

});