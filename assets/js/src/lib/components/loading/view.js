POS.module('Components.Loading', function(Loading, POS, Backbone, Marionette, $, _){

    Loading.Spinner = Marionette.ItemView.extend({
        template: false,
        className: 'loading'
    });

});