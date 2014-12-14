POS.module('Components.Filter', function(Filter, POS, Backbone, Marionette, $, _) {

    Filter.Behavior = Marionette.Behavior.extend({
        initialize: function(options){

        },

        ui: {
            searchField : 'input[type=search]',
            clearBtn 	: 'a.clear'
        },

        events: {
            'keyup @ui.searchField' : 'searchTrigger',
            'click @ui.clearBtn'    : 'clear'
        },

        onRender: function(){

        },

        searchTrigger: _.debounce( function(e){
            this.showClearButtonMaybe();
            this.search( this.ui.searchField.val() );
        }, 149),

        // all the action happens in the FilterCollection object
        search: function( query ){
            var collection = this.view.collection;
            if( ! collection ){ return; }

            var criterion = POS.Components.SearchParser.channel.request( 'facets', query );
            var fields = this.getOption('fields');
            collection.filterBy( 'search',
                //_.bind( collection.matchMaker, collection, criterion, fields )
                _.partial( collection.matchMaker, criterion, fields )
            );
        },

        // clear the filter
        clear: function(e) {
            e.preventDefault();
            this.view.collection.resetFilters();
            this.ui.searchField.val('');
            this.showClearButtonMaybe();
        },

        showClearButtonMaybe: function() {
            _.isEmpty( this.ui.searchField.val() ) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
        }

    });

});