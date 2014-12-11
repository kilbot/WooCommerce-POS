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
                POSApp.channel.trigger('init:products', controller);
            }

            // return the right region
            return controller.columnsLayout.rightRegion;
        },
        cart: function(id) {
            var controller = new POSApp.Cart.Controller({ id: id, region: this.init() });
            POSApp.channel.trigger('init:cart', controller);
        },
        checkout: function(id) {
            var controller = new POSApp.Checkout.Controller({ id: id, region: this.init() });
            POSApp.channel.trigger('init:checkout', controller);
        },
        receipt: function(id) {
            var controller = new POSApp.Receipt.Controller({ id: id, region: this.init() });
            POSApp.channel.trigger('init:receipt', controller);
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
    POSApp.channel.comply( 'show:cart', function(id) {
        id ? POS.navigate('cart/' + id) : POS.navigate('') ;
        API.cart(id);
    });

    POSApp.channel.comply( 'show:checkout', function(id) {
        id ? POS.navigate('checkout/' + id) : POS.navigate('checkout') ;
        API.checkout(id);
    });

    POSApp.channel.comply( 'show:receipt', function(id) {
        id ? POS.navigate('receipt/' + id) : POS.navigate('receipt') ;
        API.receipt(id);
    });

});