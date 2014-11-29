_.extend( Marionette.Region.prototype, {

    twoColumns: function( controller ) {

        // create the two column scaffold
        this.$el.addClass('two-column');
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
        layout.on( 'show', function() {
            console.log('two column show');
            this.addTabs();
        }, this);

        // show
        controller.show( layout, { region: this } )

    },

    addTabs: function() {

        // get tabs component
        var view = POS.Components.Tabs.channel.request( 'get:tabs', [
            { value: 'left' }, { value: 'right' }
        ]);

        // add listeners
        view.collection.on( 'change:active', function( tab ){
            this.$el
                .removeClass('left-active right-active')
                .addClass( tab.id + '-active' );
        }, this);

        this.leftRegion.on( 'update:title', function( label ){
            view.collection.get('left').set({ label: label });
        });

        this.rightRegion.on( 'update:title', function( label ){
            view.collection.get('right').set({ label: label });
        });

        // render tabs and add to the dom
        view.render();
        $('<div/>').addClass('column-tabs tabs').html(view.$el).insertBefore(this.$el);
        view.collection.get('left').set({ active: true });

        // attach tabsView to mainRegion
        this.tabsView = view;

    }

});