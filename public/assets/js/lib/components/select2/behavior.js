define(['app', 'select2'], function(POS){
	
	POS.module('Components.Select2', function(Select2, POS, Backbone, Marionette, $, _){
	
		Select2.Behavior = Marionette.Behavior.extend({

			initialize: function(options){

				this.options = _.defaults(options, {
					minimumInputLength	: 2,
					formatNoMatches		: pos_params.select.no_matches,
					formatSearching		: pos_params.select.searching,
					formatLoadMore		: pos_params.select.load_more,
					formatInputTooShort	: this.formatInputTooShort,
					formatInputTooLong	: this.formatInputTooLong,
					formatSelectionTooBig: this.formatSelectionTooBig,
					formatResult		: this.view.formatResult,
					formatSelection 	: this.view.formatSelection
				});

			},

			ui: {
				select: '.select2'
			},

			onRender: function() {
				this.ui.select.select2( this.options );
			},

			onBeforeDestroy: function() {
				this.ui.select.select2( 'destroy' );	
			},

			formatInputTooShort: function( input, min ) { 
				var n = min - input.length; 
				if( n > 1 ) {
					var str = pos_params.select.too_shorts;
					return str.replace( "%d", n );
				} else {
					return pos_params.select.too_short;
				}
			},

			formatInputTooLong: function( input, max ) { 
				var n = input.length - max; 
				if( n > 1 ) {
					var str = pos_params.select.too_longs;
					return str.replace( "%d", n );
				} else {
					return pos_params.select.too_long;
				}
			},

			formatSelectionTooBig: function( limit ) {
				if( limit > 1 ) {
					var str = pos_params.select.too_bigs;
					return str.replace( "%d", limit );
				} else {
					return pos_params.select.too_big;
				}
			},

		});

	});

});