POS.module('Components.Alerts', function(Alerts, POS, Backbone, Marionette, $, _) {

    Alerts.Behavior = Marionette.Behavior.extend({

        initialize: function(){
            this.listenToOnce(this.view, 'alert:open', this.openAlert);
            this.listenToOnce(this.view, 'alert:close', this.closeAlert);
        },

        openAlert: function(){
            this.view.render();
            this.view.$el.fadeIn( 500 );
            $('body').append(this.view.$el);
            this.view.isShown = true;
        },

        closeAlert: function() {
            this.view.$el.fadeOut( 500, function() {
                Marionette.ItemView.prototype.destroy.call(this.view);
            }.bind(this));
        }

    });

});