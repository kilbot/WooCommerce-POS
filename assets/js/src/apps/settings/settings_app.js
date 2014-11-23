POS.module('SettingsApp', function(SettingsApp, POS, Backbone, Marionette, $, _){

    /**
     * Settings Module
     */
    SettingsApp.startWithParent = false;

    SettingsApp.onStart = function(){
        POS.debugLog( 'log', 'POS Settings Module started' );
        var tab = POS.getCurrentRoute() || 'general';
        new SettingsApp.Show.Controller({ tab: tab });
    };

});
