define(['underscore', 'backbone', 'accounting', 'autoGrowInput', 'handlebars', 'views/Helpers'], 
	function(_, Backbone, accounting, autoGrowInput, Handlebars) {

	// view holds individual cart items
	var CartItem = Backbone.View.extend({
		tagName : 'tr',
		template: Handlebars.compile( $('#tmpl-cart-item').html() ),
		params: pos_params,

		events: {
			"click .remove a"	: "removeFromCart",
			"click input"  		: "change",
			"keypress input"  	: "updateOnEnter",
      		"blur input"      	: "save"
		},

		initialize: function( options ) {

			// set the accounting settings
			accounting.settings = this.params.accounting;

			// listen for changes to CartItem model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();

			// render the single cart item
			this.$el.html( ( this.template( item ) ) );

			// add a function to autosize the Qty & Price inputs
			this.$('input').autoGrowInput();

			return this;
		},

		removeFromCart: function(e) {
			if( typeof e.target !== 'undefined' ) { e.preventDefault(); }
			this.$el.fadeOut(200, function(){
				$(this).remove();
			});
			this.model.destroy();
		},

		change: function(e) {
			 this.$(e.target).addClass('editing').focus().select();
		},

		save: function(e) {
			var input 	= $(e.target),
				key 	= input.data('id'),
				value 	= input.val(),
				decimal = accounting.unformat( value, accounting.settings.number.decimal );

			switch( key ) {
				case 'qty':
					if ( value === this.model.get('qty') ) { break; }
					if ( value === 0 ) {
						this.removeFromCart();
						break;
					}
					if ( value ) {
						this.model.save( { qty: value } );
						input.removeClass('editing');
					} else {
						input.focus();
					}
					break;

				case 'price':
					if( !isNaN( decimal ) ) {
						this.model.save( { display_price: decimal } );
					} else {
						input.focus();
					}
					break;		
			}
		},

		updateOnEnter: function(e) {

			// enter key triggers blur as well?
			if (e.keyCode === 13) { this.save(e); }
		},

	});

  return CartItem;
});