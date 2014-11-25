POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-cart').html() ),
        tagName: 'section',
        regions: {
            listRegion: '.list',
            totalsRegion: '.list-totals',
            actionsRegion: '.cart-actions'
        },
        attributes: {
            class: 'module cart-module'
        }
    });

    /**
     * Single Cart Item
     */
    Cart.Item = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-cart-item').html() );
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

    Cart.List = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Item,
        emptyView: Cart.EmptyView,

        serializeData: function(data) {
            console.log(data);
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

        modelEvents: {
            'change': 'render'
        }
    });

    /**
     * Cart Actions
     */
    Cart.Actions = Marionette.ItemView.extend({
        template: _.template( $('#tmpl-cart-actions').html() ),

        triggers: {
            'click .action-void' 	: 'cart:void:clicked',
            'click .action-note' 	: 'cart:note:clicked',
            'click .action-discount': 'cart:discount:clicked',
            'click .action-checkout': 'cart:checkout:clicked'
        }

    });

});