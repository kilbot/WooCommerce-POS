POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-cart').html() ),
        tagName: 'section',
        regions: {
            listRegion      : '.list',
            totalsRegion    : '.list-totals',
            actionsRegion   : '.cart-actions',
            notesRegion     : '.cart-notes'
        },
        attributes: {
            'class'         : 'module cart-module',
            'data-title'    : 'Cart'
        }
    });

    /**
     * Cart Products
     */
    Cart.Item = Marionette.ItemView.extend({
        tagName: 'li',
        className: function() {
            return this.model.get('type');
        },

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
            'change'   : 'render',
            'focus:row': 'focusRow'
        },

        events: {
            'click .action-remove' 	     : 'removeItem',
            'click .action-more'         : 'toggleDrawer',
            'blur input[type="text"]'    : 'onBlur',
            'click .title'               : 'editTitle',
            'blur .title'                : 'onBlur',
            'keypress .title'            : 'saveOnEnter'
        },

        focusRow: function() {
            var self = this;

            var list        = this.$el.closest('.list');
            var scrollTop   = list.scrollTop();
            var listTop     = list.position().top;
            var listBottom  = list.height() + listTop;
            var itemTop     = this.$el.position().top;
            var itemBottom  = this.$el.height() + itemTop;

            if( itemTop < listTop ) {
                scrollTop -= ( listTop - itemTop );
            }

            if( itemBottom > listBottom ) {
                scrollTop += ( itemTop - list.height() );
            }

            // scroll to row
            this.$el.addClass('bg-success').closest('.list').animate({
                scrollTop: scrollTop
            }, 'fast', function() {
                // focus title if shipping or fee
                if( self.model.get( 'type' ) === 'fee' || self.model.get( 'type' ) === 'shipping' ) {
                    self.editTitle();
                }

                // pulse
                self.$el.animate({
                    backgroundColor: 'transparent'
                }, 500, function() {
                    self.$el.removeClass('bg-success').removeAttr('style');
                });
            });

        },

        remove: function() {
            // disable button
            this.$('.action-remove').attr( 'disabled', 'true' );

            // remove drawer
            if( this.drawer ) { this.drawer.remove(); }

            // add bg colour and fade out
            this.$el.addClass('bg-danger').parent('ul').addClass('animating');
            this.$el.fadeOut( 500, function() {
                this.$el.parent('ul').removeClass('animating');
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        removeItem: function() {
            this.model.destroy();
        },

        editTitle: function() {
            this.$('.title').attr( 'contenteditable', 'true' ).focus();
        },

        save: function(e) {
            var input 	= $(e.target),
                key 	= input.data('id'),
                value 	= input.val();

            // if no key, check for title
            if( _.isUndefined( key ) ) {
                if( $(e.target).hasClass('title') ){
                    value = $(e.target).text();
                    this.model.save({ title: value });
                }
                return;
            }

            // check for sensible input
            if( _.isNaN( parseFloat( value ) ) ) {
                input.select();
                return;
            }

            // always store numbers as float
            if( value ){
                value = POS.Utils.unformat( value );
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

        // note: enter will trigger blur on inputs
        saveOnEnter: function(e) {
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
        },

        toggleDrawer: function(e) {
            e.preventDefault();

            if( _.isUndefined( this.drawer ) ) {
                var el = $('<li />').addClass('drawer').hide();
                this.drawer = new Cart.Drawer({ el: el, model: this.model });
                this.drawer.render();
                this.$el.after( this.drawer.$el );
            }

            if( this.drawer.$el.is(':hidden') ) {
                this.trigger('opening:drawer');
                $(e.currentTarget).addClass('icon-rotate-180').blur();
            } else {
                $(e.currentTarget).removeClass('icon-rotate-180').blur();
            }

            this.drawer.$el.slideToggle( 'fast' );
        }

    });

    Cart.Drawer = Marionette.ItemView.extend({
        initialize: function() {
            this.template = Handlebars.compile($('#tmpl-cart-item-drawer').html());
        },

        serializeData: function() {
            var data = this.model.toJSON();
            data.tax_labels = POS.tax_labels;
            return data;
        },

        behaviors: {
            AutoGrow: {},
            Numpad: {}
        },

        events: {
            //'change input[type=checkbox]': 'checkboxChanged',
            //'change select'              : 'selectChanged',
            //'blur input'                 : 'save',
            //'keypress input[type="text"]': 'saveOnEnter'
            'change input'      : 'save',
            'change select'     : 'save',
            'change textarea'   : 'save',
            'click .action-add-meta': 'addMetaFields',
            'click .action-remove-meta': 'removeMetaFields'
        },

        open: function( callback ) {
            this.$el.slideDown('fast', callback );
        },

        close: function( callback ) {
            this.$el.slideUp('fast', callback );
        },

        remove: function() {
            this.$el.slideUp( 'fast', function() {
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        checkboxChanged: function(e) {
            var data = {};
            data[ e.target.name ] = e.target.checked;
            this.model.save(data);
        },

        selectChanged: function(e) {
            var data = {};
            data[ e.target.name ] = e.target.value;
            this.model.save(data);
        },

        save: function(e) {
            var el 	      = $(e.target),
                name      = el.attr('name').split('.'),
                attribute = name[0],
                value     = el.val(),
                data      = {};

            if( el.is('input') && el.attr('type') === 'checkbox' ) {
                value = el.prop('checked');
            }

            // special case numpad
            if( el.data('numpad') ){
                // do number check?
            }

            // special case product meta
            if( name.length > 1 && attribute === 'meta' ) {
                var key = el.parent('span').data('key');
                var meta = ( this.model.get('meta') || [] );

                // select row (or create new one)
                var row = _.where( meta, { 'key': key } );
                row = row.length > 0 ? row[0] : { 'key': key };
                row[ name[1] ] = value;

                // add the change row and make unique on key
                meta.push(row);
                value = _.uniq( meta, 'key' );
            }

            data[ attribute ] = value;

            this.model.save(data);
        },

        onBlur: function(e) {
            console.log(e);
        },

        addMetaFields: function(e){
            e.preventDefault();

            var row = $(e.currentTarget).prev('span').data('key');
            var i = row ? row + 1 : 1 ;

            var label = '<input type="text" name="meta.label">';
            var value = '<textarea name="meta.value"></textarea>';
            var btn = '<a href="#" class="action-remove-meta"><i class="icon icon-times"></i></a>';

            $('<span data-key="'+ i +'" />')
                .append( label + value + btn )
                .insertBefore( $(e.currentTarget) );
        },

        removeMetaFields: function(e){
            e.preventDefault();

            var row = $(e.currentTarget).parent('span');
            var meta = ( this.model.get('meta') || [] );
            var index = _.findIndex( meta, { 'key': row.data('key') } );
            if( index >= 0 ){
                meta.splice( index, 1 );
                this.model.save({ 'meta': meta });
            }
            
            row.remove();

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

    Cart.Items = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Item,
        emptyView: Cart.EmptyView,

        childEvents: {
            'opening:drawer': function(e) {
                this.children.each( function(view) {
                    if( _(view).has('drawer') ) {
                        view.drawer.close();
                        view.$('.action-more').removeClass('icon-rotate-180');
                    }
                });
            }
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

            // original total for calculating percentage discount
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
                value = POS.Utils.unformat( value );
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
            'click .action-fee'     : 'fee:clicked',
            'click .action-shipping': 'shipping:clicked',
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