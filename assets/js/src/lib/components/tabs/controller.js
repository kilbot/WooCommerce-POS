POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

    /**
     * API
     */
    Tabs.channel = Backbone.Radio.channel('tabs');

    Tabs.channel.reply( 'get:tabs', function( collection ) {

        var view = new Tabs.View({
            collection: collection
        });
        return view;

    });

});