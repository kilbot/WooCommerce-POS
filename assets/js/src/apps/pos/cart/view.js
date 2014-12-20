POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-cart').html() ),
        tagName: 'section',
        regions: {
            listRegion      : '.list',
            totalsRegion    : '.list-totals',
            customerRegion  : '.cart-customer',
            actionsRegion   : '.cart-actions',
            notesRegion     : '.cart-notes',
            footerRegion    : '.list-footer'
        },
        attributes: {
            'class'         : 'module cart-module'
        }
    });

    /**
     * Cart line item
     */
    Cart.Line = Marionette.LayoutView.extend({
        tagName: 'li',
        className: function() { return this.model.get('type'); },
        template: _.template('<div class="item"></div><div class="drawer"></div>'),
        regions: {
            itemRegion: '.item',
            drawerRegion: '.drawer'
        },

        modelEvents: {
            'focus:row': 'focusRow'
        },

        onRender: function(){
            var view = new Cart.Line.Item({ model: this.model });

            this.listenTo( view, 'drawer:open', this.openDrawer );
            this.listenTo( view, 'drawer:close', this.closeDrawer );
            this.listenTo( view, 'drawer:toggle', function(){
                this.drawerRegion.hasView() ? this.closeDrawer() : this.openDrawer();
            });

            this.itemRegion.show(view);

            this.listenToOnce( this.itemRegion.currentView, 'animation:finished', function(){
                Marionette.ItemView.prototype.remove.call(this);
            });
        },

        // remove is triggered once item has finished animating
        remove: function(){},

        openDrawer: function(){
            var view = new Cart.Line.Drawer({ model: this.model });
            this.drawerRegion.show(view);
            this.$el.addClass('drawer-open');
        },

        closeDrawer: function(){
            this.drawerRegion.empty();
            this.$el.removeClass('drawer-open');
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
                scrollTop += ( itemTop - list.height() + 4 );
            }

            // scroll to row
            this.$el.addClass('bg-success').closest('.list').animate({
                scrollTop: scrollTop
            }, 'fast', function() {
                // focus title if shipping or fee
                if( self.model.get( 'type' ) === 'fee' || self.model.get( 'type' ) === 'shipping' ) {
                    self.$('.title strong.action-edit-title').focus();
                }

                // pulse
                self.$el.animate({
                    backgroundColor: 'transparent'
                }, 500, function() {
                    self.$el.removeClass('bg-success').removeAttr('style');
                });
            });
        }
    });

    /**
     * Cart Products
     */
    Cart.Line.Item = POS.View.Form.extend({
        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-cart-item').html() );
        },

        //serializeData: function() {
        //    var data = this.model.toJSON();
        //
        //    if( POS.getOption('tax').tax_display_cart === 'incl' ) {
        //        data.subtotal += data.subtotal_tax;
        //        data.total += data.total_tax;
        //    }
        //
        //    return data;
        //},

        templateHelpers: function(){
            if( POS.getOption('tax').tax_display_cart === 'incl' ) {
                var data = {};
                data.subtotal = this.model.get('subtotal') + this.model.get('subtotal_tax');
                data.total = this.model.get('total') + this.model.get('total_tax');
                return data;
            }
        },

        behaviors: {
            AutoGrow: {},
            Numpad: {}
        },

        ui: {
            remove: '.action-remove',
            more: '.action-more'
        },

        events: {
            'click @ui.remove' : 'removeItem'
        },

        triggers: {
            'click @ui.more'   : 'drawer:toggle'
        },

        bindings: {
            'input[name="qty"]'   : {
                observe: 'qty',
                onGet: function(value) {
                    return POS.Utils.formatNumber(value, 'auto');
                },
                onSet: POS.Utils.unformat
            },
            'strong.action-edit-title': 'title',
            'input[name="item_price"]'   : {
                observe: 'item_price',
                onGet: POS.Utils.formatNumber,
                onSet: POS.Utils.unformat
            }
        },

        remove: function() {
            // Remove the validation binding
            Backbone.Validation.unbind(this);

            // disable button
            this.$('.action-remove').attr( 'disabled', 'true' );

            // add bg colour and fade out
            this.$el.addClass('bg-danger').parent('ul').addClass('animating');
            this.$el.fadeOut( 500, function() {
                this.$el.parent('ul').removeClass('animating');
                this.trigger('animation:finished');
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        removeItem: function() {
            this.model.destroy();
        }

    });

    /**
     * Product drawer: extra line item settings
     */
    Cart.Line.Drawer = POS.View.Form.extend({
        initialize: function() {
            this.template = Handlebars.compile($('#tmpl-cart-item-drawer').html());
        },

        behaviors: {
            AutoGrow: {},
            Numpad: {}
        },

        ui: {
            addMeta     : '.action-add-meta',
            removeMeta  : '.action-remove-meta',
            metaLabel   : 'input[name="meta.label"]',
            metaValue   : 'textarea[name="meta.value"]'
        },

        events: {
            'click @ui.addMeta'     : 'addMetaFields',
            'click @ui.removeMeta'  : 'removeMetaFields',
            'blur @ui.metaLabel'    : 'updateMeta',
            'blur @ui.metaValue'    : 'updateMeta'
        },

        bindings: {
            'input[name="regular_price"]'   : 'regular_price',
            'input[name="taxable"]'         : 'taxable',
            'select[name="tax_class"]'      : {
                observe: 'tax_class',
                selectOptions: {
                    collection: function(){
                        return POS.getOption('tax_labels');
                    }
                }
            },
            'select[name="shipping_method"]': {
                observe: 'shipping_method',
                selectOptions: {
                    collection: function(){
                        return POS.getOption('shipping');
                    },
                    comparator: function(){}
                }
            }
        },

        onShow: function() {
            this.$el.hide().slideDown(250);
        },

        remove: function() {
            this.$el.slideUp( 250, function() {
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        updateMeta: function(e) {
            var el 	      = $(e.target),
                name      = el.attr('name').split('.'),
                attribute = name[0],
                value     = el.val(),
                data      = {};

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
        childView: Cart.Line,
        emptyView: Cart.EmptyView
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
            if( POS.getOption('tax').tax_display_cart === 'incl' ) {
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