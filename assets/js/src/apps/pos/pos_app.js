POS.module('POSApp', {

    startWithParent: false,

    initialize: function() {
        this.channel = Backbone.Radio.channel('pos');
    }

});

POS.module('POSApp', function(POSApp, POS, Backbone, Marionette, $, _) {

    // API
    var API = {
        init: function(){
            // check registry for products controller
            var controller = _( POS._registry ).find( function( controller ){
                return controller instanceof POSApp.Products.Controller;
            });

            // init products if required
            if( ! controller ){
                controller = new POSApp.Products.Controller();
            }

            // return the right region
            return controller.columnsLayout.rightRegion;
        },
        cart: function(id) {
            new POSApp.Cart.Controller({ id: id, region: this.init() });
        },
        checkout: function(id) {
            new POSApp.Checkout.Controller({ id: id, region: this.init() });
        },
        receipt: function(id) {
            new POSApp.Receipt.Controller({ id: id, region: this.init() });
        }
    };

    // add routes
    POS.on('before:start', function(options) {
        new Marionette.AppRouter({
            controller: API,
            appRoutes: {
                '' : 'cart',
                'cart' : 'cart',
                'cart/:id' : 'cart',
                'checkout' : 'checkout',
                'checkout/:id' : 'checkout',
                'receipt/:id' : 'receipt'
            }
        });
    });

    // radio API
    this.channel.comply({
        'show:cart': function(id) {
            var url = id ? 'cart/' + id : '';
            this.POS.navigate( url );
            API.cart(id);
        },
        'show:checkout': function(id) {
            var url = id ? 'checkout/' + id : 'checkout';
            this.POS.navigate( url );
            API.checkout(id);
        },
        'show:receipt': function(id) {
            var url = id ? 'receipt/' + id : 'receipt';
            this.POS.navigate( url );
            API.receipt(id);
        }
    }, this);

});