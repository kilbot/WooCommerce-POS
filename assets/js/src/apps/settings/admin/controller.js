var POS = (function(App, Backbone, Marionette, $, _) {

    App.SettingsApp.Controller = Marionette.Controller.extend({

        initialize: function (options) {

            this.settingsRegion = new Marionette.Region({
                el: '#wc-pos-settings'
            });

            this.modalRegion = new Marionette.Region({
                el: '#wc-pos-modal'
            });
            App.Components.Modal.controller = new App.Components.Modal.Controller({
                container: this.modalRegion
            });

            // get settings collection and bootstrap with inline json data
            this.settingsCollection = App.Entities.channel.request('wp_option:entities');
            this.settingsCollection.add( App.bootstrap );

            this._showTabs( options );
            this._showSettings( options );

        },

        _showTabs: function ( options ) {
            var view = new App.SettingsApp.Views.Tabs( options );

            // tab clicked
            this.listenTo(view, 'settings:tab:clicked', function (tab) {
                App.navigate( tab );
                this._showSettings({ tab: tab });
            }, this);

        },

        _showSettings: function ( options ) {
            var view = new App.SettingsApp.Views.Settings({
                collection: this.settingsCollection,
                model: this.settingsCollection.get( options.tab )
            });

            // form submit
            this.listenTo(view, 'settings:form:submit', function (model) {
                this._saveSettings(model);
            });

            this.settingsRegion.show(view);

        },

        _saveSettings: function (model) {
            model.save();
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);