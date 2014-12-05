POS.module('CustomerApp', function(CustomerApp, POS, Backbone, Marionette, $, _){

    CustomerApp.startWithParent = false;

    CustomerApp.channel = Backbone.Radio.channel('customer');

    /**
     * API
     */
    CustomerApp.channel.reply( 'customer:select', function(options) {
        var controller = new CustomerApp.Select.Controller(options);
        return controller.getSelectView();
    });

});