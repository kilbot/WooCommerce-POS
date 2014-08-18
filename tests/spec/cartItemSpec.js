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

			// Instantiate a new CartItem instance
			var collection = new CartItems([], { cartId: 'test' });
			this.model = new CartItem(dummy_product, { collection: collection });
		});

		it("should be in a valid state", function() {	
			expect(this.model.isValid()).toBe(true);
		});

		it("should initiate with the correct values", function() {
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( 2 );
			expect(this.model.get('item_discount')).toBe(1);
			expect(this.model.get('line_discount')).toBe(1);
		});

		it("should re-calculate on quantity change to any floating point number", function() {
			
			var qty = _.random(10, true);
			this.model.set( { 'qty': qty } );

			expect(this.model.get('qty')).toBe(qty);
			expect(this.model.get('line_total')).toBe( parseFloat( (2 * qty).toFixed(4) ) );
			expect(this.model.get('line_discount')).toBe( parseFloat( (1 * qty).toFixed(4) ) );

		});

		it("should initiate with correct exclusive tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';

			// change product to taxable
			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('line_tax')).toBe(0.28);
			expect(this.model.get('line_tax_2')).toBe(0.18);
			expect(this.model.get('line_tax_3')).toBe(0.1);
			
		});

		it("should initiate with correct inclusive tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';

			// change product to taxable
			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('line_tax')).toBe(0.2456);
			expect(this.model.get('line_tax_2')).toBe(0.1579);
			expect(this.model.get('line_tax_3')).toBe(0.0877);
			
		});

		it("should re-calculate exclusive tax with change to quantity", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';

			this.model.set( { 'qty': 3, 'taxable': true } );

			expect(this.model.get('item_tax')).toBe(0.28);
			expect(this.model.get('item_tax_2')).toBe(0.18);
			expect(this.model.get('item_tax_3')).toBe(0.1);
			expect(this.model.get('line_tax')).toBe(0.84);
			expect(this.model.get('line_tax_2')).toBe(0.54);
			expect(this.model.get('line_tax_3')).toBe(0.3);

		});

		it("should re-calculate inclusive tax with change to quantity", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';

			this.model.set( { 'qty': 3, 'taxable': true } );

			expect(this.model.get('item_tax')).toBe(0.2456);
			expect(this.model.get('item_tax_2')).toBe(0.1579);
			expect(this.model.get('item_tax_3')).toBe(0.0877);
			expect(this.model.get('line_tax')).toBe(0.7369);
			expect(this.model.get('line_tax_2')).toBe(0.4737);
			expect(this.model.get('line_tax_3')).toBe(0.2632);

		});

		it("should calculate line discount on change to price field", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'no';

			// set new price to $1.50, item already on sale
			this.model.set( { 'qty': 2, 'item_price': 1.5 } );

			expect(this.model.get('item_price')).toBe( 1.5 );
			expect(this.model.get('item_discount')).toBe( 1.5 );
			expect(this.model.get('line_total')).toBe( 3 );
			expect(this.model.get('line_discount')).toBe( 3 );
		});

		it("should re-calculate exclusive tax with item discount", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';

			// set new price to $1.50
			this.model.set( { 'taxable': true, 'qty': 2, 'item_price': 1.5 } );

			expect(this.model.get('line_tax')).toBe(0.42);
			expect(this.model.get('line_tax_2')).toBe(0.27);
			expect(this.model.get('line_tax_3')).toBe(0.15);

		});

		it("should re-calculate inclusive tax with item discount", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';

			// set new price to $1.50
			this.model.set( { 'taxable': true, 'qty': 2, 'item_price': 1.5 } );

			expect(this.model.get('line_tax')).toBe(0.3684);
			expect(this.model.get('line_tax_2')).toBe(0.2368);
			expect(this.model.get('line_tax_3')).toBe(0.1316);
		});

	});

});