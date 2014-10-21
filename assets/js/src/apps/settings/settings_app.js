POS.module('SettingsApp', function(SettingsApp, POS, Backbone, Marionette, $, _){

    /**
     * Settings Module
     */
    SettingsApp.startWithParent = false;

    SettingsApp.onStart = function(){
        if( POS.debug ) console.log('starting Settings Module');

        new SettingsApp.Admin.Controller();

    };

});