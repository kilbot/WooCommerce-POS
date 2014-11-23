POS.module('POSApp.Receipt', function(Receipt, POS, Backbone, Marionette, $, _) {

    Receipt.Layout = Marionette.LayoutView.extend({
        template: _.template('<a href="#cart">cart</a>')
    });

});