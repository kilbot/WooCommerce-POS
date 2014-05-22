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
			this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); // debug

			// update cart item subtotals
			this.listenTo(this, 'add change:qty change:discount', this.update );
			
		},

		// Set the total for the cart item ( input price x quantity )
		update: function() {

			// do taxes first
			if( this.get('taxable') ) {
				var tax_total = calcTaxLineTotal( this );
				this.set('taxes.line_total', tax_total);

				// if itemized
				if( wc.tax_total_display === 'itemized' ) {
					var itemized = this.get('taxes').itemized;
					_.each(itemized, function(tax_rate) {
						this.set('taxes.itemized.' + tax_rate.rate_id + '.line_total', calcTaxLineTotal( this, tax_rate.tax_amount ) );
					}, this);
				}
			}

			// update discount
			this.set('total_discount', this.get('qty') * this.get('discount') );

			// update total
			var total = calcLineTotal(this, false);
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

			// update cart totals
			this.listenTo( this, 'add change:qty change:discount remove', this.updateTotals );
		},

		// update the CartTotals model
		updateTotals: function() {

			// if cart is empty, clear the models and bail
			if(this.length === 0) {
				cartTotals.removeAll();
				return;
			}

			var totals = [], // the totals array
				subtotal = calcSubtotal( this ),
				cartdiscount = calcCartDiscount( this ),
				tax_total = calcTaxTotal( this ),
				tax_labels = this.tax_labels(),
				total = calcTotal( this );

			// add subtotal
			totals.push( { label: 'Subtotal:', total: subtotal } );

			// add discount
			if( cartdiscount !== 0 ) {
				totals.push( { label: 'Cart Discount:', total: cartdiscount } );
			}

			// add tax
			if( wc.calc_taxes === 'yes' && tax_total > 0 ) {
				if (wc.tax_total_display === 'itemized') {
					_.each(tax_labels, function(tax) {
						totals.push( { label: tax.label + ':', total: calcTaxTotal( this, tax.id ) } );
					}, this);
				}
				else {
					totals.push( { label: wc.tax_label + ':', total: tax_total } );
				}
			}

			// add total
			totals.push( { label: 'Total:', total: total } );

			// update the CartTotals model
			// update all at once so there is only one change event
			cartTotals.set( totals );
		},

		// get the tax ids and labels (from the first item in cart, should be same for all items)
		tax_labels: function() {
			var labels = [];
			var taxes = this.at(0).get('taxes.itemized');
			_.each(taxes, function(tax) {
				labels.push( { id: tax.rate_id, label: wc.tax_label + ' (' + tax.label + ')' });
			});
			return labels;
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

			// add a fucntion to autosize the Qty & Price inputs
			this.$el.find('input[type=number]').autosizeInput();
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
					if ( value === '0' ) {
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
		// model: cartItems,

		initialize: function() {

			// listen for changes
			this.listenTo(cartItems, 'add', this.addOne);
			this.listenTo(cartItems, 'reset', this.addAll);
			this.listenTo(cartItems, 'all', this.render);			
		},

		render: function() {
			console.log('render the cart items'); // debug

			// if empty, add empty message
			if( cartItems.length === 0 ) {
				this.emptyMessage();
			}
			
		},

		addOne: function( item ) {

			// if first, remove empty message and init the totals view
			if( cartItems.length === 1 ) {
				this.$el.removeClass('empty').html('');
				var cartTotalsView = new CartTotalsView();
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
		idAttribute: 'label',

		initialize: function() {
			this.on('all', function(e) { console.log("Totals Model: " + e); }); // debug
		}
	});

	var CartTotals = Backbone.Collection.extend({
		model: CartTotal,

		// debug
		initialize: function() { 
			this.on('all', function(e) { console.log("Total Collection event: " + e); }); // debug
		},

		removeAll: function() {
			this.each( function(item) {
				this.remove( item );
			}, this);

			this.reset();
		},

	});

	// the view contining a single total
	var CartTotalView = Backbone.View.extend({
		tagName : 'tr',
		// model: new CartTotal(),
		model: CartTotal,
		template: _.template($('#tmpl-cart-total').html()),

		initialize: function() {

			// listen for changes to CartItem model
			this.listenTo( this.model, 'add change', this.render );
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

			this.listenTo(cartTotals, 'all', this.render);	
			
			// render on init
			this.render();
		},

		render: function() {

			console.log('render the totals'); // debug

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


	// init the collection and make available elsewhere
	var cartTotals = new CartTotals();


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
	 * @param  {object} model           the product
	 * @return {float}                  the total
	 */
	function calcLineTotal(model) {
		var qty = model.get('qty'),
			price = model.get('price'),
			tax = 0,
			total = 0;

		// if cart item is taxable, get tax
		if( model.get('taxable') ) { tax = model.get('taxes').line_total; } 

		if( wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			tax = model.get('taxes').total;
			total = ( price - tax ) * qty;
		}

		else if( wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {
			total = ( qty * price ) - tax;
		}

		//
		else {
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
	 * @return {float} line_total
	 */
	function calcTaxLineTotal(model, itemized) {
		var tax_total = model.get('taxes').total,
			price = model.get('price'),
			discount = model.get('discount'),
			qty = model.get('qty'),
			line_total = 0;

		var tax = typeof itemized !== 'undefined' ? itemized : tax_total ; // default is the total tax

		if( discount !== 0 && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			tax = ( tax / ( price - tax_total ) ) * ( price - tax_total - discount );
		} 

		else if( discount !== 0 ) {
			tax = ( tax / price ) * ( price - discount );
		}

		line_total = tax * qty;

		return line_total;
	}

	/**
	 * Calculate discount (original price - new price)
	 * @param  {float} price 	the original price
	 * @param  {object}	model	the product 
	 * @return {float} discount 
	 */
	function calcLineDiscount(price, model) {
		var original = model.get('price'),
			tax = 0,
			discount = 0;

		// if cart item is taxable, get tax
		if( model.get('taxable') ) { tax = model.get('taxes').total; } 

		// round price now if required
		if( wc.round_at_subtotal === 'no' ) {
			original = accounting.formatNumber(original);
		}

		if( wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			discount = ( original - tax ) - price;
		}
		else {
			discount = original - price;
		}

		return discount;
	}



	/**
	 * Loop over all items in cart and calculate the discounts
	 * @param  {object} collection 	the cart items
	 * @return {float} discount
	 */
	function calcCartDiscount(collection) {
		var discount = 0;

		// cart discount = sum(total_discount)
		discount = _.reduce(collection.pluck('total_discount'), function(memo, num){ return memo + num; }, 0);

		return discount;
	}

	/**
	 * Loop over all items in cart and calculate the tax
	 * @param  {object} collection 	the cart items 
	 * @return {float} tax
	 */
	function calcTaxTotal(collection, rate_id) {
		var tax = 0;

		// if rate_id is specified, then sum total tax for that id
		if( typeof rate_id !== 'undefined' ) {
			tax = _.reduce(collection.pluck('taxes.itemized.' + rate_id + '.line_total'), function(memo, num){ return memo + num; }, 0);
		}

		// else, just sum the total tax
		else {
			tax = _.reduce(collection.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0);
		}

		return tax;
	}

	/**
	 * Display the line total
	 * @param  {object} collection 	the cart items
	 * @return {float} subtotal
	 */
	function displayLineTotal(model) {
		var price = model.get('price'),
			qty = model.get('qty'),
			total = 0,
			tax = 0;

		if( model.get('taxable') ) { tax = model.get('taxes').total; } 

		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl'  ) {
			total = ( price - tax ) * qty;
		}

		else {
			total = price * qty;
		}

		return total;

	}

	function displayLinePrice(model) {
		var price = model.get('price'),
			tax = 0;

		// if cart item is taxable, get tax
		if( model.get('taxable') ) { tax = model.get('taxes').total; } 

		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
			price = price - tax;
		}

		return price;
	}

	/**
	 * Display the cart subtotal
	 * @param  {object} collection 	the cart items
	 * @return {float} subtotal
	 */
	function calcSubtotal(collection) {
		var line_subtotal = 0,
			// line_discount = 0,
			line_tax = 0,
			subtotal = 0;

		line_subtotal = _.reduce(collection.pluck('total'), function(memo, num){ return memo + num; }, 0);
		// line_discount = _.reduce(collection.pluck('total_discount'), function(memo, num){ return memo + num; }, 0);

		// if price includes tax: cart subtotal = sum(line_subtotal) + sum(line_tax)
		if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'incl' ) {
			line_tax = _.reduce(collection.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0);
		} 

		// subtotal = line_subtotal - line_discount + line_tax;
		subtotal = line_subtotal + line_tax;

		return subtotal;
	}

	/**
	 * Display the cart total
	 * @param  {object} collection 	the cart items
	 * @return {float} subtotal
	 */
	function calcTotal(collection) {
		var line_subtotal = 0,
			line_discount = 0,
			line_tax = 0,
			total = 0;

		line_subtotal = _.reduce(collection.pluck('total'), function(memo, num){ return memo + num; }, 0);
		line_discount = _.reduce(collection.pluck('total_discount'), function(memo, num){ return memo + num; }, 0);

		if ( wc.calc_taxes === 'yes' ) {
			line_tax = _.reduce(collection.pluck('taxes.line_total'), function(memo, num){ return memo + num; }, 0);
		}

		total = line_subtotal - line_discount + line_tax;

		return total;
	}


}(jQuery));