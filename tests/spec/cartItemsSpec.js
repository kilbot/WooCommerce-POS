/**
 * Test the cart item calculates correct values based on pos_params.
 *
 * Params:
 * calc_taxes
 * prices_include_tax
 * tax_display_cart
 * tax_round_at_subtotal
 * tax_total_display
 *
 * Properties:
 * {float} item_discount
 * {float} item_price
 * {float} item_tax
 * {float} item_tax_{tax_code}
 * {float} line_discount
 * {float} line_tax
 * {float} line_tax_{tax_code}
 * {float} line_total
 * {float} qty
 * 
 */

define(['json!dummy-products', 'entities/cart/items', 'entities/cart/item'], 
	function(dummy_products, CartItems, CartItem) {

	// get the dummy product
	var products = dummy_products.products;

	describe("A cart", function() {

		beforeEach(function() {

			// reset pos_params
			pos_params.wc.calc_taxes = 'no';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';
			pos_params.wc.tax_round_at_subtotal = 'no';
			pos_params.wc.tax_total_display = 'single';

			// Instantiate a new CartItem instance
			this.collection = new CartItems(products, { cartId: 'test' });
		});

		it("should contain the correct number of items", function() {	
			expect(this.collection.length).toBe(products.length);
		});

	});

});