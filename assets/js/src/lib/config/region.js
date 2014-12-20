_.extend( Marionette.Region.prototype, {

    twoColumns: function() {

        // log
        POS.debugLog('log', 'Init two column layout');

        // create the two column scaffold
        var Layout = Marionette.LayoutView.extend({
            template: _.template('<div id="left"></div><div id="right"></div>'),
            regions: {
                leftRegion: '#left',
                rightRegion: '#right'
            }
        });

        // attach layout to controller
        var layout = new Layout();

        // create tabs on show
        this.listenTo( layout, 'show', function() {
            this.$el.addClass('two-column');
            this.addTabs( layout );
        });

        return layout;

    },

    addTabs: function( layout ) {

        // get tabs component
        var view = POS.Components.Tabs.channel.request( 'get:tabs', [
            { value: 'left' }, { value: 'right' }
        ]);

        // listen to tab changes
        this.listenTo( view.collection, 'change:active', function( tab ){
            this.$el
                .removeClass('left-active right-active')
                .addClass( tab.id + '-active' );
        });

        // update tab labels
        POS.channel.comply( 'update:tab:label', function( label, column ){
            view.collection.get(column).set({ label: label });
        });

        // init tabs
        view.collection.get('left').set({ active: true });
        POS.layout.tabsRegion.show(view);

        // teardown
        this.on( 'empty', function() {
            this.$el.removeClass('two-column left-active right-active');
            POS.layout.tabsRegion.empty();
        });

    }

});