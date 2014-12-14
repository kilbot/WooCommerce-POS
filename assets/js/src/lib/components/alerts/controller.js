POS.module('Components.Alerts', function(Alerts, POS, Backbone, Marionette, $, _) {

    // init modal component on start
    POS.addInitializer(function() {
        new Alerts.Controller();
    });

    // API
    Alerts.channel = Backbone.Radio.channel('alerts');

    // Controller
    Alerts.Controller = Marionette.Controller.extend({

        queue: {},

        initialize: function(){

            Alerts.channel.comply( 'open:alert', function(options){
                this.queueAlert(options);
            }, this);

            this.on( 'alert:queued', this.checkQueue );
            this.on( 'alert:removed', this.checkQueue );

        },

        queueAlert: function (options) {
            var view = new Alerts.View(options);
            this.queue[view.cid] = view;
            this.trigger( 'alert:queued' );

            this.listenTo( view, 'destroy', function(){
                delete this.queue[view.cid];
                this.trigger( 'alert:removed' );
            });
        },

        checkQueue: function(){
            var open = _.find(this.queue, function(view) {
                return view.isOpen;
            });
            var next = _.find(this.queue, function(view) {
                return _.isUndefined( view.isOpen );
            });
            if( !open && next ) {
                this.openAlert( next );
            }
        },

        openAlert: function( view ){
            view.trigger( 'alert:open' );
        }

    });

});