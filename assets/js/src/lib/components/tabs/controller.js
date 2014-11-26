POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

    /**
     * API
     */
    Tabs.channel = Backbone.Radio.channel('tabs');

    Tabs.channel.reply( 'get:tabs', function( tabs ) {

        var collection = new Tabs.Collection( tabs );

        var view = new Tabs.View({
            collection: collection
        });
        return view;

    });

});