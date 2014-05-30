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
 * {string} display_price
 * {string} display_total
 * {float} item_discount
 * {float} item_price
 * {float} line_total
 * {float} qty
 * {float} line_tax_{tax_code}
 * {float} line_tax
 * {float} total_discount
 * 
 */

define(['jquery', 'underscore', 'backbone', 'accounting', 'models/CartItem', 'json!dummy-products' ], 
	function($, _, Backbone, accounting, CartItem, dummy_products) {

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
			this.model = new CartItem(dummy_product);
		});

		it("should be in a valid state", function() {
			
			expect(this.model.isValid()).toBe(true);
		});

		it("should initiate with the correct values", function() {
			
			expect(this.model.get('display_price')).toBe( '2.00' );
			expect(this.model.get('display_total')).toBe( '2.00' );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( 2 );
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('total_discount')).toBe(0);
		});

		it("should re-calculate on quantity change to any floating point number", function() {
			
			var qty = _.random(10, true);
			this.model.set( { 'qty': qty } );

			expect(this.model.get('display_price')).toBe( '2.00' );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( dummy_product.price * qty ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( parseFloat( accounting.formatNumber( (2 * qty), 4 ) ) );
			expect(this.model.get('qty')).toBe(qty);
			expect(this.model.get('total_discount')).toBe(0);
		});

		it("should initiate with correct exclusive tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';

			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( 2 );
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.28);
			expect(this.model.get('line_tax_2')).toBe(0.18);
			expect(this.model.get('line_tax_3')).toBe(0.1);
			
		});

		it("should display correctly if prices exclude tax but cart includes tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'incl';

			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 2.28 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( 2 );
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.28);
			expect(this.model.get('line_tax_2')).toBe(0.18);
			expect(this.model.get('line_tax_3')).toBe(0.1);
			
		});

		it("should initiate with correct inclusive tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';
			pos_params.wc.tax_display_cart = 'incl';

			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe(1.7544);
			expect(this.model.get('line_total')).toBe(1.7544);
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.2456);
			expect(this.model.get('line_tax_2')).toBe(0.1579);
			expect(this.model.get('line_tax_3')).toBe(0.0877);
			
		});

		it("should display correctly if prices include tax but cart excludes tax", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';
			pos_params.wc.tax_display_cart = 'excl';

			this.model.set( { 'taxable': true } ).trigger('change:qty');

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 1.7544 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe(1.7544);
			expect(this.model.get('line_total')).toBe(1.7544);
			expect(this.model.get('qty')).toBe(1);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.2456);
			expect(this.model.get('line_tax_2')).toBe(0.1579);
			expect(this.model.get('line_tax_3')).toBe(0.0877);
			
		});

		it("should re-calculate exclusive tax with change to quantity", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';

			this.model.set( { 'qty': 3, 'taxable': true } );

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 2 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 6 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe( 2 );
			expect(this.model.get('line_total')).toBe( 6 );
			expect(this.model.get('qty')).toBe(3);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.84);
			expect(this.model.get('line_tax_2')).toBe(0.54);
			expect(this.model.get('line_tax_3')).toBe(0.3);

		});

		it("should re-calculate inclusive tax with change to quantity", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';
			pos_params.wc.tax_display_cart = 'incl';

			this.model.set( { 'qty': 3, 'taxable': true } );

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( dummy_product.price ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( dummy_product.price * 3 ) );
			expect(this.model.get('item_discount')).toBe(0);
			expect(this.model.get('item_price')).toBe(1.7544);
			expect(this.model.get('line_total')).toBe(5.2632);
			expect(this.model.get('qty')).toBe(3);
			expect(this.model.get('total_discount')).toBe(0);
			expect(this.model.get('line_tax')).toBe(0.7369);
			expect(this.model.get('line_tax_2')).toBe(0.4737);
			expect(this.model.get('line_tax_3')).toBe(0.2632);

		});

		it("should calculate line discount on change to price field", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'no';

			// set new price to $1.50 = 50 cent discount per item, $1.00 total discount
			this.model.set( { 'taxable': true, 'qty': 2, 'display_price': '1.50' } );

			expect(this.model.get('display_price')).toBe( accounting.formatNumber( 1.5 ) );
			expect(this.model.get('display_total')).toBe( accounting.formatNumber( 4 ) );
			expect(this.model.get('item_discount')).toBe( 0.5 );
			expect(this.model.get('item_price')).toBe( 1.5 );
			expect(this.model.get('line_total')).toBe( 3 );
			expect(this.model.get('qty')).toBe( 2 );
			expect(this.model.get('total_discount')).toBe( 1 );
		});

		it("should re-calculate exclusive tax with item discount", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'no';
			pos_params.wc.tax_display_cart = 'excl';

			// set new price to $1.50 = 50 cent discount per item, $1.00 total discount
			this.model.set( { 'taxable': true, 'qty': 2, 'display_price': '1.50' } );

			expect(this.model.get('display_price')).toBe( '1.50' );
			expect(this.model.get('display_total')).toBe( '4.00' );
			expect(this.model.get('item_discount')).toBe(0.5);
			expect(this.model.get('item_price')).toBe( 1.5 );
			expect(this.model.get('line_total')).toBe( 3 );
			expect(this.model.get('qty')).toBe(2);
			expect(this.model.get('total_discount')).toBe(1);
			expect(this.model.get('line_tax')).toBe(0.42);
			expect(this.model.get('line_tax_2')).toBe(0.27);
			expect(this.model.get('line_tax_3')).toBe(0.15);

		});

		it("should re-calculate inclusive tax with item discount", function() {

			// set up data based on user settings
			pos_params.wc.calc_taxes = 'yes';
			pos_params.wc.prices_include_tax = 'yes';
			pos_params.wc.tax_display_cart = 'incl';

			// set new price to $1.50 = 50 cent discount per item, $1.00 total discount
			this.model.set( { 'taxable': true, 'qty': 2, 'display_price': '1.50' } );

			expect(this.model.get('display_price')).toBe( '1.50' );
			expect(this.model.get('display_total')).toBe( '4.00' );
			expect(this.model.get('item_discount')).toBe(0.5);
			expect(this.model.get('item_price')).toBe( 1.3158 );
			expect(this.model.get('line_total')).toBe( 2.6316 );
			expect(this.model.get('qty')).toBe(2);
			expect(this.model.get('total_discount')).toBe(1);
			expect(this.model.get('line_tax')).toBe(0.3684);
			expect(this.model.get('line_tax_2')).toBe(0.2368);
			expect(this.model.get('line_tax_3')).toBe(0.1316);
		});

	});

});