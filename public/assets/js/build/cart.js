/**
 * 1. Display items in the cart
 * 2. Calculate totals
 * 3. Send cart to server
 *
 * TODO: tax calculations stink :(  needs to be cleaned up 
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
	 Cart Items
	 ===========================================================================*/ 

	// store the product data, add qty, total & discount by default
	var CartItem = Backbone.DeepModel.extend({
		defaults : {
			'qty'		: 1,
			'total'		: 0.00,
			'discount'	: 0.00,
			'total_discount': 0.00,
		},

		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

			// update line item subtotals
			this.listenTo( this, 'add change:qty change:discount', this.updateLineTotals );
			
		},

		// 
		updateLineTotals: function() {
			var qty = this.get('qty');

			// do taxes first
			if( this.get('taxable') ) {
				var tax_total = calcTaxLineTotal( this );
				this.set('taxes.line_total', tax_total);
				this.set('taxes.line_subtotal', this.get('taxes.total') * qty )

				// if itemized
				if( wc.tax_total_display === 'itemized' ) {
					var itemized = this.get('taxes').itemized;
					_.each(itemized, function(tax_rate) {
						this.set('taxes.itemized.' + tax_rate.rate_id + '.line_total', calcTaxLineTotal( this, tax_rate.tax_amount ) );
						this.set('taxes.itemized.' + tax_rate.rate_id + '.line_subtotal', tax_rate.tax_amount * qty );
					}, this);
				}
			}

			// update discount
			this.set('total_discount', this.get('discount') * qty );

			// update line total
			var total = calcLineTotal(this);
			this.set('total', total);
		},

		// Increase or decrease the quantity
		quantity: function( type ) {
			var qty = this.get('qty');
			this.set('qty', (type === 'increase' ? ++qty : --qty) );
		},

	});

	// the collection of cart items
	var CartItems = Backbone.Collection.extend({
		url: pos_cart_params.ajax_url,
		model: CartItem,

  		// debug
		initialize: function() { 
			this.on('all', function(e) { console.log("Cart Collection event: " + e); }); // debug
		},

	});

	// view holds individual cart items
	var CartItemView = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-cart-item').html()),

		events: {
			"click .remove a"	: "removeFromCart",
			"click input"  		: "change",
			"keypress input"  	: "updateOnEnter",
      		"blur input"      	: "close"
		},

		initialize: function() {

			// listen for changes to CartItem model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();

			item.price = displayLinePrice( this.model );

			// format item price & total
			if( item.discount !== 0 ) {
				item.price = item.price - item.discount;
				item.discounted = accounting.formatMoney( displayLineTotal(this.model) - item.total_discount );
			}
			item.total = accounting.formatMoney( displayLineTotal(this.model) );

			// add 'ex. tax' if necessary
			// if( wc.tax_display_cart === 'excl') {
			// 	item.total = item.total + ' <small>(ex. tax)</small>';
			// }

			// render the single cart item
			this.$el.html( ( this.template( item ) ) );

			// add a function to autosize the Qty & Price inputs
			this.$('input[type=number]').autoGrowInput();

			return this;
		},

		removeFromCart: function(e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.$el.fadeOut(200, function(){
				$(this).remove();
			});
			cartItems.remove( this.model );
		},

		change: function(e) {
			 this.$(e.target).addClass('editing').focus().select();
		},

		close: function(e) {
			var input 	= $(e.target);
			var key 	= input.data('id');
			var value 	= parseFloat(input.val()); // sanitise input

			switch( key ) {
				case 'qty':
					if ( value === this.model.get('qty') ) { break; }
					if ( value === 0 ) {
						this.removeFromCart();
						break;
					}
					if ( value ) {
						this.model.set( { qty: value } );
						input.removeClass('editing');
					} else {
						input.focus();
					}
					break;

				case 'price':
					if( value ) {
						this.model.set( { discount: calcLineDiscount( value, this.model ) } );
					} else {
						input.focus();
					}
					break;		
			}
		},

		updateOnEnter: function(e) {

			// enter key triggers blur as well?
			if (e.keyCode === 13) { this.close(e); }
		},

	});

	// view for the cart items
	var CartItemsView = Backbone.View.extend({
		el: $('#cart-items'),
		elEmpty: $('#cart-items').contents().clone(),

		initialize: function() {

			// listen for changes
			this.listenTo(cartItems, 'add', this.addOne);
			this.listenTo(cartItems, 'reset', this.addAll);
			this.listenTo(cartItems, 'remove', this.render);			
		},

		render: function() {

			// if empty, add empty message
			if( cartItems.length === 0 ) {
				this.emptyMessage();
			}
			
		},

		addOne: function( item ) {

			// if first, remove empty message and init the totals view
			if( cartItems.length === 1 ) {
				this.$el.removeClass('empty').html('');
			}

			// create a new CartItemView
			var newItem = new CartItemView({ model: item });

			// add the new CartItemView
			this.$el.append( newItem.render().el );
		},

		addAll: function() {

			// this will come into play with parked carts
			cartItems.each(this.addOne, this);
    	},

		emptyMessage: function() {
			this.$el.addClass('empty').html(this.elEmpty);
		},

	});

	// init the collection and make available elsewhere
	var cartItems = new CartItems();

	// show the list of Products
	var cartItemsView = new CartItemsView();


	/*============================================================================
	 Totals
	 ===========================================================================*/

	var CartTotal = Backbone.Model.extend({
		defaults: {
			label: '',
			total: 0.00
		},
		idAttribute: 'label',

		initialize: function() { 
			// this.on('all', function(e) { console.log(this.get('label') + " event: " + e); }); // debug
		},
	});

	var CartTotals = Backbone.Collection.extend({
		model: CartTotal,
		comparator: 'id', // order by id

		// debug
		initialize: function() { 
			// this.on('all', function(e) { console.log("Total Collection event: " + e); }); // debug
			
			// listen to line_totals, update subtotal on change or remove
			this.listenTo( cartItems, 'change remove', this.updateTotals );
		},

		updateTotals: function() {
			var totals = [],
				subtotal_sum = 0,
				discount_sum = 0,
				tax_sum = 0,
				total_sum =0,
				tax_labels = [];

			// clear the totals
			this.reset();

			// bail if the cart is empty
			if( cartItems.length === 0 ) { 
				return; 
			} 

			// sum up the line totals
			subtotal_sum = _.reduce( cartItems.pluck('total'), function(memo, num){ return memo + num; }, 0 );
			totals.push( { id: 1, label: 'Subtotal:', total: subtotal_sum } );

			// sum the line discounts
			discount_sum = _.reduce( cartItems.pluck('total_discount'), function(memo, num){ return memo + num; }, 0 );
			if( discount_sum !== 0 ) {
				totals.push( { id: 2, label: 'Cart Discount:', total: discount_sum } );
			} 

			// sum up the line totals
			if( wc.calc_taxes === 'yes' ) {
				tax_labels = this.tax_labels();
				tax_sum = _.reduce( cartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );
				if( tax_sum !== 0 ) {
					if (wc.tax_total_display === 'itemized') {
						_.each(tax_labels, function(tax) {
							var i = 3;
							tax_sum = _.reduce( cartItems.pluck('taxes.itemized.' + tax.id + '.line_total' ), function(memo, num){ return memo + num; }, 0 );
							totals.push( { id: i, label: tax.label, total: tax_sum } );
							i++;
						}, this);
					}
					else {
						totals.push( { id: 3, label: tax_labels[0].label, total: tax_sum } );
					}
				}
			}

			// special case for cart includes tax
			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
				tax_sum = _.reduce( cartItems.pluck('taxes.line_subtotal'), function(memo, num){ return memo + num; }, 0 );
				totals[0].total = subtotal_sum + tax_sum;
			}

			else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {
				tax_sum = _.reduce( cartItems.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0 );
				totals[0].total = subtotal_sum + tax_sum;
			}

			// remove the old total, add up the totals and set the new total
			total_sum = subtotal_sum - discount_sum + tax_sum;
			totals.push( { id: 100, label: 'Total:', total: total_sum } );

			// update the CartTotals models
			this.reset( totals );

		},

		// get the tax ids and labels 
		// TODO: what happens if first item not taxable???
		tax_labels: function() {
			var labels = [],
				prefix = '';
			var taxes = cartItems.at(0).get('taxes.itemized');

			// special case for cart includes tax
			if( wc.calc_taxes === 'yes' && wc.tax_display_cart === 'incl' ) {
				prefix = 'includes ';
			}

			if( wc.tax_total_display === 'itemized' ) {
				_.each(taxes, function(tax) {
					labels.push( { id: tax.rate_id, label: prefix + wc.tax_label + ' (' + tax.label + '):' });
				});
			}
			else {
				labels.push( { id: 0, label: prefix + wc.tax_label + ':' });
			}
			return labels;
		},

	});

	// the view contining a single total
	var CartTotalView = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-cart-total').html()),

		initialize: function() {

		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();

			// make cart discounts display as negative
			if( item.label === 'Cart Discount:') {
				item.total *= -1; 
			}

			// format total for currency
			item.total = accounting.formatMoney( item.total );

			// // add 'ex. tax' if necessary
			// if( item.label === 'Subtotal:' && wc.tax_display_cart === 'excl') {
			// 	item.total = item.total + ' <small>(ex. tax)</small>';
			// }

			// render the single total
			this.$el.html( ( this.template( item ) ) );

			return this;
		},
	});		
	
	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		events: {
			"click #pos_checkout"	: "checkout",
		},

		initialize: function() {
			this.listenTo( cartTotals, 'reset', this.render );
		},

		render: function() {

			this.$el.removeClass('empty').html('');

			// Loop through the collection
			cartTotals.each(function( item ){

				// Render each item model into this List view
				var newTotal = new CartTotalView({ model : item });
				this.$el.append( newTotal.render().el );

			// Pass this list views context
			}, this);

			// add the action buttons
			if (cartTotals.length > 0) {
				this.$el.append( _.template($('#tmpl-cart-action').html()) );
			}
		},

		checkout: function() {
			// send the cart data to checkout
			mediator.publish('checkout', cartItems, cartTotals );
		},

	});


	// init the cart total collection and make available elsewhere
	var cartTotals = new CartTotals();

	// itit the cart total view
	var cartTotalsView = new CartTotalsView();


	/*============================================================================
	 Mediator
	 ===========================================================================*/ 

	// subscribe to addToCart from the product list
	mediator.subscribe('addToCart', function( product ){

		// if product already exists in cart, increase qty
		// I don't know if this is the best way, but it's a way ...
		if(_.contains( cartItems.pluck('id'), product.attributes.id )) {
			var item = cartItems.get( product.attributes.id );
			item.quantity('increase');
		}

		// else, add the product
		else { 
			cartItems.add( product.attributes );
		}
	});


	/*============================================================================
	 Cart Calculations
	 ===========================================================================*/ 

	/**
	 * Calculate the line total
	 * @param  {object} model 	the product
	 * @return {float} total 	the total
	 */
	function calcLineTotal(product) {
		var qty = product.get('qty'),
			price = product.get('price'),
			tax = 0,
			total = 0;

		// if cart item is taxable, get tax
		if( product.get('taxable') ) { tax = product.get('taxes').line_total; } 
		
		if( wc.prices_include_tax === 'yes' ) {
			total = (qty * price) - tax;
		} else {
			total = qty * price;
		}

		// round price now if required
		if( wc.round_at_subtotal === 'no' ) {
			total = accounting.formatNumber(total);
		}

		return total;
	}

	/**
	 * Calculate the line item tax total
	 * @param  {object} model 	the product
	 * @return {float} line_total tax
	 */
	function calcTaxLineTotal(model, itemized) {
		var tax_total = parseFloat( model.get('taxes.total') ),
			price = parseFloat( model.get('price') ),
			discount = parseFloat( model.get('discount') ),
			qty = parseFloat( model.get('qty') );

		var tax = typeof itemized !== 'undefined' ? itemized : tax_total ; // default is the total tax


		if( discount !== 0 && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
			tax = ( tax / ( price + tax_total ) ) * ( price + tax_total - discount );
		}

		else if( discount !== 0 && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			tax = ( tax / ( price - tax_total ) ) * ( price - tax_total - discount );
		} 

		else if( discount !== 0 ) {
			tax = ( tax / price ) * ( price - discount );
		}

		return tax * qty;
	}

	/**
	 * Calculate discount (original price - new price)
	 * @param  {float} price 	the original price
	 * @param  {object}	model	the product 
	 * @return {float} discount 
	 */
	function calcLineDiscount(newprice, model) {
		var original = parseFloat( model.get('price') ),
			tax = 0,
			discount = 0;

		// if cart item is taxable, get tax
		if( model.get('taxable') ) { tax = parseFloat( model.get('taxes.total') ); } 

		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
			discount = original + tax - newprice;
		}

		else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			discount = original - tax - newprice;
		}

		else {
			discount = original - newprice;
		}

		// round discount if required
		if( wc.round_at_subtotal === 'no' ) {
			discount = accounting.formatNumber(discount);
		}

		return discount;
	}


	function displayLinePrice(model) {
		var price = parseFloat( model.get('price') ),
			tax = 0;

		// if cart item is taxable, get tax
		if( model.get('taxable') ) { tax = parseFloat( model.get('taxes.total') ); } 

		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
			price = price + tax;
		}

		else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			price = price - tax;
		}

		return price;
	}

	/**
	 * Display the line total
	 * @param  {object} collection 	the cart items
	 * @return {float} subtotal
	 */
	function displayLineTotal(model) {
		var price = parseFloat( model.get('price') ),
			qty = parseFloat( model.get('qty') ),
			total = 0,
			tax = 0;

		if( model.get('taxable') ) { tax = parseFloat( model.get('taxes.total') ); } 

		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl'  ) {
			total = ( price + tax ) * qty;
		}

		else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl'  ) {
			total = ( price - tax ) * qty;
		}

		else {
			total = price * qty;
		}

		return total;

	}


}(jQuery));