var POS = (function(App) {

    App.Behaviors.Tooltip = Marionette.Behavior.extend({

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

    return POS;

})(POS || {});