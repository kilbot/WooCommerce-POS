/**
* Based on https://github.com/brian-mann/sc02-loading-views
*/

POS.module('Components.Loading', function(Loading, POS, Backbone, Marionette, $, _){

    /**
     * API
     */
    Loading.channel = Backbone.Radio.channel('loading');

    Loading.channel.comply('show:loading', function(view, options) {
        return new Loading.Controller({
            view: view,
            region: options.region,
            config: options.loading
        });
    });

    /**
     * Controller
     */
    Loading.Controller = POS.Controller.Base.extend({

        initialize: function(options) {
            var view 	= options.view,
                config 	= options.config;

            config = _.isBoolean(config) ? {} : config;

            _.defaults(config, {
                loadingType : 'spinner',
                loadingMessage : ''
                // entities 	: this.getEntities(view),
                // debug 		: false
            });

            switch (config.loadingType) {
                case 'spinner':
                    var loadingView = new Loading.Spinner({ message: config.loadingMessage });
                    this.show(loadingView);
                break;
                case 'opacity':
                    this.region.currentView.$el.css({ 'opacity': 0.5 });
                break;
                default:
                    throw new Error('Invalid loadingType');
            }

            this.showRealView(view, loadingView, config);
        },

        showRealView: function(realView, loadingView, config){
            var self = this,
                array = config.entities;

            // expect an array of promises
            if( ! _.isArray( array ) ) {
                array = [config.entities];
            }

            $.when.apply( $, array ).done( function( data, textStatus, jqXHR ){
                switch (config.loadingType) {
                    case 'spinner':
                        if(self.region.currentView !== loadingView) {
                            return realView.close();
                        }
                    break;
                    case 'opacity':
                        self.region.currentView.$el.removeAttr('style');
                    break;
                }
                self.show(realView);
            }).fail( function( jqXHR, textStatus, errorThrown ){
                POS.debugLog('error', errorThrown);
                loadingView.fail(textStatus);
            });
        }

        // getEntities: function(view) {
        // 	_.chain(view).pick('model', 'collection').toArray().compact().value();
        // }

    });

});