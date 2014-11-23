POS.module('SupportApp', function(SupportApp, App, Backbone, Marionette, $, _) {

    SupportApp.startWithParent = false;

    SupportApp.channel = Backbone.Radio.channel('support');

    // API
    var API = {
        show: function() {
            new SupportApp.Show.Controller();
        }
    }

    // add routes to App at start
    POS.addInitializer( function(){
        new Marionette.AppRouter({
            controller: API,
            appRoutes: {
                'support' : 'show'
            }
        });
    });

});