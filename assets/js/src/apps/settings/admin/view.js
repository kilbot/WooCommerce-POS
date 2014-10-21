POS.module('SettingsApp.Admin.View', function(View, POS, Backbone, Marionette, $, _){

    View.Layout = Marionette.LayoutView.extend({
        template: '#tmpl-wc-pos-settings-layout',

        regions: {
            tabsRegion: '#wc-pos-settings-tabs',
            settingsRegion: '#wc-pos-settings'
        }

    });

    View.Settings = Marionette.ItemView.extend({
        //template: Handlebars.compile($('#tmpl-settings-general').html()),
        tagName: "table",
        template: _.template( $('#tmpl-wc-pos-settings-general').html() ),

        serializeData: function() {
            var data = {
                label: 'Hello World!'
            };
            return data;
        }
    });

});