POS.module('POSApp.Checkout', function(Checkout, POS, Backbone, Marionette, $, _) {

    Checkout.Layout = Marionette.LayoutView.extend({
        template: _.template('<a href="#receipt/1">receipt</a>')
    });

});