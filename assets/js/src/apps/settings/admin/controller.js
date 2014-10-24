var POS = (function(App, Backbone, Marionette, $, _) {

    App.SettingsApp.Controller = Marionette.Controller.extend({

        initialize: function () {

            this.settingsRegion = new Marionette.Region({
                el: '#wc-pos-settings'
            });

            // store form state
            var settingsModel = Backbone.Model.extend({ idAttribute: "key" });
            var settingsCollection = Backbone.Collection.extend({ model: settingsModel });
            this.settingsCollection = new settingsCollection();

            this._showTabs();
            this._showSettings({ tab: 'general' });

        },

        _showTabs: function () {
            var view = new App.SettingsApp.Views.Tabs();

            // tab clicked
            this.listenTo(view, 'settings:tab:clicked', function (tab) {
                this._showSettings({ tab: tab });
            }, this);

        },

        _showSettings: function (options) {
            _.defaults( options, { col: this.settingsCollection } );
            var view = new App.SettingsApp.Views.Settings(options);

            // tab clicked
            this.listenTo(view, 'settings:form:submit', function (data) {
                this._saveSettings(data);
            });

            this.settingsRegion.show(view);

        },

        _saveSettings: function (data) {
            console.log(data);
            data.action = 'wc_pos_save_admin_settings';

            /* global ajaxurl */
            $.post(ajaxurl, data, function (resp) {
                console.log(resp);
            });

        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);