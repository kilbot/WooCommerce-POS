POS.module('Components.Loading', function(Loading, POS, Backbone, Marionette, $, _){

    Loading.Spinner = Marionette.ItemView.extend({
        className: 'loading',

        initialize: function( options ){
            this.on( 'update:message', this.render );
        },

        render: function() {
            var message = '';
            if( !_.isEmpty( this.options.message ) ) {
                message = '<p>' + this.options.message + '</p>';
            };
            this.$el.html( '<p><i class="icon icon-spinner icon-lg"></i></p>' + message );
            return this;
        }

    });

});