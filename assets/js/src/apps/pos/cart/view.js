POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-cart').html() ),
        tagName: 'section',
        regions: {
            productRegion: '.product-list',
            feeRegion: '.fee-list',
            shippingRegion: '.shipping-list',
            totalsRegion: '.list-totals',
            actionsRegion: '.cart-actions',
            notesRegion: '.cart-notes'
        },
        attributes: {
            class: 'module cart-module'
        }
    });

    /**
     * Cart Products
     */
    Cart.Product = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-cart-product').html() );
        },

        serializeData: function() {
            var data = this.model.toJSON();

            if( POS.tax.tax_display_cart === 'incl' ) {
                data.subtotal += data.subtotal_tax;
                data.total += data.total_tax;
            }

            return data;
        },

        behaviors: {
            AutoGrow: {},
            Numpad: {}
        },

        modelEvents: {
            'change': 'render',
            'pulse' : 'pulse'
        },

        events: {
            'click .action-remove' 	: 'removeItem',
            'keypress input'  		: 'saveOnEnter',
            'blur input'      		: 'onBlur'
        },

        pulse: function() {
            this.$el.addClass('bg-success').animate({
                backgroundColor: 'transparent'
            }, 500, function() {
                $(this).removeClass('bg-success').removeAttr('style');
            });
        },

        remove: function() {
            this.$el.addClass('bg-danger').parent('ul').addClass('animating');
            this.$el.fadeOut( 500, function() {
                this.$el.parent('ul').removeClass('animating');
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        removeItem: function() {
            this.model.destroy();
        },

        save: function(e) {
            var input 	= $(e.target),
                key 	= input.data('id'),
                value 	= input.val();

            // check for sensible input
            if( _.isNaN( parseFloat( value ) ) ) {
                input.select();
                return;
            }

            // always store numbers as float
            if( value ){
                value = POS.unformat( value );
                value = parseFloat( value );
            }

            // if qty is 0, delete the item
            if( key === 'qty' && value === 0 ) {
                this.removeItem();
                return;
            }

            // save
            var data = {};
            data[key] = value;
            this.model.save(data);

        },

        saveOnEnter: function(e) {

            // enter key triggers blur as well?
            if ( e.which === 13 ) {
                this.save(e);
                this.model.trigger('change');
            }

        },

        onBlur: function(e) {
            if( $(e.target).attr('aria-describedby') === undefined ) {
                this.save(e);
                this.model.trigger('change');
            }
        }

    });

    /**
     * Cart Collection
     */
    Cart.EmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'empty',
        template: '#tmpl-cart-empty'
    });

    Cart.Products = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Product,
        emptyView: Cart.EmptyView
    });

    /**
     * Fees
     */
    Cart.Fee = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function () {
            this.template = Handlebars.compile($('#tmpl-cart-fee').html());
        }
    });

    Cart.Fees = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Fee,

        initialize: function() {
            //this.collection = new Backbone.Collection([{ id: 1 }, { id: 2 }]);
        }
    });

    /**
     * Shipping
     */
    Cart.Ship = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function () {
            this.template = Handlebars.compile($('#tmpl-cart-shipping').html());
        }
    });

    Cart.Shipping = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Ship,

        initialize: function() {
            //this.collection = new Backbone.Collection([{ id: 1 }, { id: 2 }]);
        }
    });

    /**
     * Cart Totals
     */
    Cart.Totals = Marionette.ItemView.extend({
        tagName: 'ul',

        initialize: function() {
            this.template = Handlebars.compile($('#tmpl-cart-totals').html());
        },

        behaviors: {
            AutoGrow: {},
            Numpad: {}
        },

        modelEvents: {
            'change': 'render'
        },

        ui: {
            discount: '.order-discount'
        },

        events: {
            'click @ui.discount .total' 	: 'edit',
            'keypress @ui.discount input'   : 'saveOnEnter',
            'blur @ui.discount input'	    : 'onBlur'
        },

        serializeData: function() {
            var data = this.model.toJSON();

            // prices include tax?
            if( POS.tax.tax_display_cart === 'incl' ) {
                data.subtotal += data.subtotal_tax;
                data.cart_discount = data.subtotal - data.total;
                data.incl_tax = true;
            }

            // orginal total for calculating percentage discount
            data.original = data.total + data.order_discount;

            return data;
        },

        edit: function(e) {
            $(e.currentTarget).addClass('editing').children('input').trigger('show:numpad');
        },

        save: function(e) {
            var input 	= $(e.target),
                value 	= input.val();

            // check for sensible input
            if( _.isNaN( parseFloat( value ) ) ) {
                input.select();
                return;
            }

            // always store numbers as float
            if( value ){
                value = POS.unformat( value );
                value = parseFloat( value );
            }

            // save
            this.model.save({ order_discount: value });

        },

        saveOnEnter: function(e) {
            if (e.which === 13) {
                this.save(e);
                this.model.trigger('change');
            }
        },

        showDiscountRow: function() {
            this.$('.order-discount').show().children('.total').trigger('click');
        },

        onBlur: function(e) {
            if( $(e.target).attr('aria-describedby') === undefined ) {
                this.save(e);
                this.model.trigger('change');
            }
        }

    });

    /**
     * Cart Actions
     */
    Cart.Actions = Marionette.ItemView.extend({
        template: _.template( $('#tmpl-cart-actions').html() ),

        triggers: {
            'click .action-void' 	: 'void:clicked',
            'click .action-note' 	: 'note:clicked',
            'click .action-discount': 'discount:clicked',
            'click .action-checkout': 'checkout:clicked'
        }

    });

    /**
     * Cart Notes
     */

    Cart.Notes = Marionette.ItemView.extend({
        template: _.template( '<%= note %>' ),

        modelEvents: {
            'change:note': 'render'
        },

        events: {
            'click' 	: 'edit',
            'keypress'	: 'saveOnEnter',
            'blur'		: 'save'
        },

        onShow: function() {
            this.showOrHide();
        },

        showOrHide: function() {
            if( this.model.get('note') === '' ) {
                this.$el.parent('.cart-notes').hide();
            }
        },

        edit: function(e) {
            this.$el.attr('contenteditable','true').focus();
        },

        save: function(e) {
            var value = this.$el.text();

            // validate and save
            this.model.save({ note: value });
            this.$el.attr('contenteditable','false');
            this.showOrHide();
        },

        saveOnEnter: function(e) {
            // save note on enter
            if (e.which === 13) {
                e.preventDefault();
                this.$el.blur();
            }
        },

        showNoteField: function() {
            console.log('show note');
            this.$el.parent('.cart-notes').show();
            this.$el.attr('contenteditable','true').focus();
        }
    });

});