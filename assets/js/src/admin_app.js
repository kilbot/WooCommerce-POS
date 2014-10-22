(function() {

    window.POS = new Marionette.Application();

    /**
     * Start POS App
     */
    POS.on('start', function() {

        if( typeof pos_params === 'undefined' )
            return;

        POS.debug = true;

        POS.module('SettingsApp').start();
    });

})();

// wait until everything is loaded, then start the app
jQuery( document ).ready(function() { POS.start(); });