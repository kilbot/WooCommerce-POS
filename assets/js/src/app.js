var POS = new Marionette.Application({

    initialize: function(options) {

        // init Root LayoutView
        this.layout = new Marionette.LayoutView({
            el: '#page',
            template: _.template( $('#page').html() ),
            regions: {
                headerRegion: '#header',
                menuRegion  : '#menu',
                tabsRegion  : '#tabs',
                mainRegion	: '#main',
                modalRegion	: '#modal'
            }
        });
        this.layout.render();

        // routes module
        //this.module( 'Routes', function(){
        //    this.channel = Backbone.Radio.channel('routes');
        //});

        // entites module
        this.module( 'Entities', function(){
            this.channel = Backbone.Radio.channel('entities');
        });

        // radio
        this.channel.reply('default:region', function() {
            return this.layout.mainRegion;
        }, this);

        this.channel.comply({
            'register:instance': function(instance, id) {
                return this.register(instance, id);
            },
            'unregister:instance': function(instance, id) {
                return this.unregister(instance, id);
            }
        }, this);
    },

    onBeforeStart: function(options){
        // app settings
        this.options = options;

        // boots
        accounting.settings = this.options.accounting;
    },

    onStart: function(){
        POS.startHistory();

        // header app starts on all pages
        POS.HeaderApp.start();
    }
});

// behaviors
Marionette.Behaviors.getBehaviorClass = function(options, key) {
    return POS.Components[key].Behavior;
};