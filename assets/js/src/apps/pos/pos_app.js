POS.module('POSApp', function(POSApp, POS, Backbone, Marionette, $, _) {

    POSApp.startWithParent = false;

    POSApp.channel = Backbone.Radio.channel('pos');

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
    POS.addInitializer( function(){
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
    POSApp.channel.comply({
        'show:cart': function(id) {
            id ? POS.navigate('cart/' + id) : POS.navigate('') ;
            API.cart(id);
        },
        'show:checkout': function(id) {
            id ? POS.navigate('checkout/' + id) : POS.navigate('checkout') ;
            API.checkout(id);
        },
        'show:receipt': function(id) {
            id ? POS.navigate('receipt/' + id) : POS.navigate('receipt') ;
            API.receipt(id);
        }
    });

});