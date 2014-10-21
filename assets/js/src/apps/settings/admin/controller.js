POS.module('SettingsApp.Admin', function(Admin, POS, Backbone, Marionette, $, _){

    Admin.Controller = Marionette.Controller.extend({

        initialize: function(options) {

            this.layout = new Admin.View.Layout();

            this.listenTo( this.layout, 'show', function() {
                var view = new Admin.View.Settings();
                this.layout.settingsRegion.show( view );
            });

            POS.main.show(this.layout);

        },

        show: function() {

        },

        _showGeneralSettings: function() {

        }

    });

});