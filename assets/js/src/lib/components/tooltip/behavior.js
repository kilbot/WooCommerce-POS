POS.module('Components.Tooltip', function(Tooltip, POS, Backbone, Marionette, $, _) {

    Tooltip.Behavior = Marionette.Behavior.extend({

        initialize: function(options){

            this.options = _.defaults(options, {

            });

        },

        ui: {
            tooltip: '*[data-toggle="tooltip"]'
        },

        onRender: function() {
            this.ui.tooltip.tooltip( this.options );
        },

        onBeforeDestroy: function() {
            this.ui.tooltip.tooltip( 'destroy' );
        }

    });

});