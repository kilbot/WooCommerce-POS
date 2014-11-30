_.extend( Marionette.Region.prototype, {

    twoColumns: function( controller ) {

        // log
        POS.debugLog('log', 'Init two column layout');

        // create the two column scaffold
        var Layout = Marionette.LayoutView.extend({
            template: _.template('' +
                '<div id="left"></div>' +
                '<div id="right"></div>'
            ),
            regions: {
                leftRegion: '#left',
                rightRegion: '#right'
            }
        });

        // attach regions to mainRegion
        var layout = new Layout();
        this.leftRegion = layout.leftRegion;
        this.rightRegion = layout.rightRegion;

        // create tabs on show
        this.listenTo( layout, 'show', function() {
            this.$el.addClass('two-column');
            this.addTabs();
        });

        // show
        controller.show( layout, { region: this } );

    },

    addTabs: function() {

        // get tabs component
        var view = POS.Components.Tabs.channel.request( 'get:tabs', [
            { value: 'left' }, { value: 'right' }
        ]);

        // add listeners
        this.listenTo( view.collection, 'change:active', function( tab ){
            this.$el
                .removeClass('left-active right-active')
                .addClass( tab.id + '-active' );
        });

        this.leftRegion.on( 'update:title', function( label ){
            view.collection.get('left').set({ label: label });
        });

        this.rightRegion.on( 'update:title', function( label ){
            view.collection.get('right').set({ label: label });
        });

        // render tabs and add to the dom
        view.render();
        var tabsRegion = $('<div/>').addClass('column-tabs tabs');
        tabsRegion.html(view.$el).insertBefore(this.$el);
        view.collection.get('left').set({ active: true });

        // attach tabsView to mainRegion
        this.tabsView = view;

        // teardown
        this.on( 'empty', function() {
            this.$el.removeClass('two-column left-active right-active');
            this.tabsView.destroy();
            tabsRegion.remove();
        });

    }

});