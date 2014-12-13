POS.module('Components.Select2', function(Select2, POS, Backbone, Marionette, $, _) {

    Select2.Behavior = Marionette.Behavior.extend({

        initialize: function(options){

            this.options = _.defaults(options, {
                query               : _.bind( this.view.query, this.view ),
                formatResult		: this.view.formatResult,
                formatSelection 	: this.view.formatSelection
            });

        },

        ui: {
            select: '.select2'
        },

        onRender: function() {
            if(this.ui.select.hasClass('no-search')) {
                this.options.dropdownCssClass = 'no-search';
            }
            this.ui.select.select2( this.options );
        },

        onBeforeDestroy: function() {
            this.ui.select.select2( 'destroy' );
        }

    });

});