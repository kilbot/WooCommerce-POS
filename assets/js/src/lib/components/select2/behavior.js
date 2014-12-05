POS.module('Components.Select2', function(Select2, POS, Backbone, Marionette, $, _) {

    Select2.Behavior = Marionette.Behavior.extend({

        initialize: function(options){

            this.options = _.defaults(options, {
                //minimumInputLength	: 2,
                //formatResult		: this.view.formatResult,
                //formatSelection 	: this.view.formatSelection,

                //formatMatches: function (matches) { if (matches === 1) { return "One result is available, press enter to select it."; } return matches + " results are available, use up and down arrow keys to navigate."; },
                //formatNoMatches: function () { return "No matches found"; },
                //formatInputTooShort: function (input, min) { var n = min - input.length; return "Please enter " + n + " or more character" + (n == 1 ? "" : "s"); },
                //formatInputTooLong: function (input, max) { var n = input.length - max; return "Please delete " + n + " character" + (n == 1 ? "" : "s"); },
                //formatSelectionTooBig: function (limit) { return "You can only select " + limit + " item" + (limit == 1 ? "" : "s"); },
                //formatLoadMore: function (pageNumber) { return "Loading more results…"; },
                //formatSearching: function () { return "Searching…"; }
            });

        },

        ui: {
            select: '.select2'
        },

        onShow: function() {
            this.ui.select.select2( this.options );
        },

        onBeforeDestroy: function() {
            this.ui.select.select2( 'destroy' );
        }

    });

});