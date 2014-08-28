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
	var dummy_product = dummy_products.products[0];

	describe("A cart item", function() {

		beforeEach(function() {

			// reset pos_params
			pos_params.wc.calc_taxes = 'no';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';
			pos_params.wc.tax_round_at_subtotal = 'no';
			pos_params.wc.tax_total_display = 'single';

			// Instantiate a new cart instance
			this.collection = new CartItems([], { cartId: 'test' });
			
		});

		it("should be in a valid state", function() {

			var model = new CartItem(dummy_product, { collection: this.collection });
			expect(model.isValid()).toBe(true);

		});

		it("should initiate with the correct values", function() {

			var model = new CartItem(dummy_product, { collection: this.collection });

			expect(model.get('qty')).toBe(1);
			expect(model.get('item_price')).toBe(2);
			expect(model.get('line_total')).toBe(2);

		});

		it("should re-calculate on quantity change to any floating point number", function() {

			var model = new CartItem(dummy_product, { collection: this.collection });
	
			var qty = _.random(10, true);
			model.set( { 'qty': qty } );

			expect(model.get('qty')).toBe(qty);
			expect(model.get('line_total')).toBe( parseFloat( (2 * qty).toFixed(4) ) );

		});

		it("should calculate the correct exclusive tax", function() {

			// user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_total_display = 'itemized';

			// dummy product id 99, qty 2, regular price $3, on sale for $2
			var model = new CartItem(dummy_product, { collection: this.collection });
			model.set({ 'qty': 2, 'taxable': true });
			
			expect(model.get('item_price')).toBe(2);
			expect(model.get('line_subtotal')).toBe(6);
			expect(model.get('line_subtotal_tax')).toBe(0.84);
			expect(model.get('line_total')).toBe(4);
			expect(model.get('line_tax')).toBe(0.56);
			expect(model.get('line_tax_2')).toBe(0.36);
			expect(model.get('line_tax_3')).toBe(0.2);
			
		});

		it("should calculate the correct inclusive tax", function() {

			// user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';
			pos_params.wc.tax_total_display = 'itemized';

			// dummy product id 99, qty 2, regular price $3, on sale for $2
			var model = new CartItem(dummy_product, { collection: this.collection });
			model.set({ 'qty': 2, 'taxable': true });
			
			expect(model.get('item_price')).toBe(2);
			expect(model.get('line_subtotal')).toBe(5.2632);
			expect(model.get('line_subtotal_tax')).toBe(0.7368);
			expect(model.get('line_total')).toBe(3.5088);
			expect(model.get('line_tax')).toBe(0.4912);
			expect(model.get('line_tax_2')).toBe(0.3158);
			expect(model.get('line_tax_3')).toBe(0.1754);
			
		});

		// it("should re-calculate exclusive tax with change to quantity", function() {

		// 	// set up data based on user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	pos_params.wc.prices_include_tax = 'no';

		// 	this.model.set( { 'qty': 3, 'taxable': true } );

		// 	expect(this.model.get('item_tax')).toBe(0.28);
		// 	expect(this.model.get('item_tax_2')).toBe(0.18);
		// 	expect(this.model.get('item_tax_3')).toBe(0.1);
		// 	expect(this.model.get('line_tax')).toBe(0.84);
		// 	expect(this.model.get('line_tax_2')).toBe(0.54);
		// 	expect(this.model.get('line_tax_3')).toBe(0.3);

		// });

		// it("should re-calculate inclusive tax with change to quantity", function() {

		// 	// set up data based on user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	pos_params.wc.prices_include_tax = 'yes';

		// 	this.model.set( { 'qty': 3, 'taxable': true } );

		// 	expect(this.model.get('item_tax')).toBe(0.2456);
		// 	expect(this.model.get('item_tax_2')).toBe(0.1579);
		// 	expect(this.model.get('item_tax_3')).toBe(0.0877);
		// 	expect(this.model.get('line_tax')).toBe(0.7369);
		// 	expect(this.model.get('line_tax_2')).toBe(0.4737);
		// 	expect(this.model.get('line_tax_3')).toBe(0.2632);

		// });

		// it("should calculate line discount on change to price field", function() {

		// 	// set up data based on user settings
		// 	pos_params.wc.calc_taxes = 'no';

		// 	// set new price to $1.50, item already on sale
		// 	this.model.set( { 'qty': 2, 'item_price': 1.5 } );

		// 	expect(this.model.get('item_price')).toBe( 1.5 );
		// 	expect(this.model.get('item_discount')).toBe( 1.5 );
		// 	expect(this.model.get('line_total')).toBe( 3 );
		// 	expect(this.model.get('line_discount')).toBe( 3 );
		// });

		// it("should re-calculate exclusive tax with item discount", function() {

		// 	// set up data based on user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	pos_params.wc.prices_include_tax = 'no';

		// 	// set new price to $1.50
		// 	this.model.set( { 'taxable': true, 'qty': 2, 'item_price': 1.5 } );

		// 	expect(this.model.get('line_tax')).toBe(0.42);
		// 	expect(this.model.get('line_tax_2')).toBe(0.27);
		// 	expect(this.model.get('line_tax_3')).toBe(0.15);

		// });

		// it("should re-calculate inclusive tax with item discount", function() {

		// 	// set up data based on user settings
		// 	pos_params.wc.calc_taxes = 'yes';
		// 	pos_params.wc.prices_include_tax = 'yes';

		// 	// set new price to $1.50
		// 	this.model.set( { 'taxable': true, 'qty': 2, 'item_price': 1.5 } );

		// 	expect(this.model.get('line_tax')).toBe(0.3684);
		// 	expect(this.model.get('line_tax_2')).toBe(0.2368);
		// 	expect(this.model.get('line_tax_3')).toBe(0.1316);
		// });

	});

});