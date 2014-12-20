POS.module('SupportApp', function(SupportApp, App, Backbone, Marionette, $, _) {

    SupportApp.startWithParent = false;

    SupportApp.channel = Backbone.Radio.channel('support');

    // API
    var API = {
        show: function() {
            new SupportApp.Show.Controller();
        }
    }

    // add routes
    POS.on('before:start', function(options) {
        new Marionette.AppRouter({
            controller: API,
            appRoutes: {
                'support' : 'show'
            }
        });
    });

});