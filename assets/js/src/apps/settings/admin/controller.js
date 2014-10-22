POS.module('SettingsApp.Admin', function(Admin, POS, Backbone, Marionette, $, _){

    Admin.Controller = Marionette.Controller.extend({

        initialize: function(options) {

            this.settingsRegion = new Backbone.Marionette.Region({
                el: '#wc-pos-settings'
            });

            this._showTabs();
            this._showSettings();

        },

        _showTabs: function() {
            var view = new Admin.View.Tabs();

            // tab clicked
            this.listenTo( view, 'settings:tab:clicked', function( tab ) {
                this._showSettings({ tab: tab });
            }, this);

        },

        _showSettings: function( options ) {
            var view = new Admin.View.Settings( options );

            // tab clicked
            this.listenTo( view, 'settings:form:submit', function( args ) {
                var data = Backbone.Syphon.serialize( args.view );
                this._saveSettings( data );
            });

            this.settingsRegion.show( view );
        },

        _saveSettings: function( data ) {
            data.action = 'wc_pos_save_admin_settings';
            $.post(
                pos_params.ajaxurl , data, function(resp) {
                    console.log(resp);
                }
            );

        }

    });

});