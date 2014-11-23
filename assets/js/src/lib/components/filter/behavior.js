POS.module('Components.Filter', function(Filter, POS, Backbone, Marionette, $, _) {

    Filter.Behavior = Marionette.Behavior.extend({

        ui: {
            searchField : 'input[type=search]',
            clearBtn 	: 'a.clear'
        },

        events: {
            'keyup @ui.searchField' : 'searchTrigger',
            'click @ui.clearBtn'    : 'clear'
        },

        onRender: function(){
            //this.$('input[type=search]').val('').focus();
        },

        searchTrigger: function(e){
            this.showClearButtonMaybe();
        },

        // clear the filter
        clear: function(e) {
            e.preventDefault();
            this.ui.searchField.val('');
            this.showClearButtonMaybe();
        },

        showClearButtonMaybe: function() {
            _.isEmpty( this.ui.searchField.val() ) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
        }

    });

});