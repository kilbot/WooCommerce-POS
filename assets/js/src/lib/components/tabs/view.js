POS.module('Components.Tabs', function(Tabs, POS, Backbone, Marionette, $, _){

    Tabs.ItemView = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function() {
            this.template = Handlebars.compile('' +
                '{{#unless fixed}}' +
                '<a href="#"><i class="icon icon-times-circle action-remove"></i></a>' +
                '{{/unless}}' +
                '{{{ label }}}'
            );
        },

        className: function() {
            if( this.model.get('active') ) { return 'active'; }
        },

        triggers: {
            'click': 'tab:clicked',
            'click .action-remove': 'tab:removed'
        },

        onTabClicked : function() {
            if( !this.model.get('active') ) {
                this.model.set({ active: true });
            }
        }

    });

    Tabs.View = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Tabs.ItemView,
        // className: 'nav nav-tabs',
        attributes: {
            'role' : 'tablist'
        },

        collectionEvents: {
            'change:active'	: 'render',
        },

        initialize: function() {
            this.on( 'childview:tab:removed', function( childview, args ) {
                this.collection.remove( args.model );
            });
        }

    });

});