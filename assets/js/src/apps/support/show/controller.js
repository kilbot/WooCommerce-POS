POS.module('SupportApp.Show', function(Show, POS, Backbone, Marionette, $, _) {

   Show.Controller = POS.Controller.Base.extend({

        initialize: function (options) {

            // init two column layout
            this.layout = POS.layout.mainRegion.twoColumns();

            this.listenTo( this.layout, 'show', function() {
                this.showForm();
                this.showStatus();
            });

            // show
            this.show( this.layout, { region: POS.layout.mainRegion } );

        },

       showForm: function(){
           var view = new Show.Form();

           this.listenTo( view, 'send:email', function( data ){
               $.wc_pos_ajax({
                   type: 'POST',
                   data: {
                       action: 'wc_pos_send_support_email',
                       payload: data
                   }
               });
           });

           this.layout.leftRegion.show( view );
       },

       showStatus: function() {

           var results = $.wc_pos_ajax({
               type: 'GET',
               data: {
                   action: 'wc_pos_system_status'
               }
           });

           var view = new Show.Status( results );

           POS.Components.Loading.channel.command( 'show:loading', view, {
               region: this.layout.rightRegion,
               loading: {
                   entities: results
               }
           });

       }

    });

});