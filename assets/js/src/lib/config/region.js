_.extend( Marionette.Region.prototype, {

    twoColumns: function( controller ) {

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

        var layout = new Layout();
        this.leftRegion = layout.leftRegion;
        this.rightRegion = layout.rightRegion;

        layout.on( 'show', function() {
            console.log('two column show');
            this.addTabs( layout );
        }, this);

        controller.show( layout, { region: this } )

    },

    addTabs: function() {

        var leftTab = $('<li />');
        var rightTab = $('<li />');
        $('<div />')
            .addClass('tabs column-tabs')
            .append( $('<ul />').append(leftTab, rightTab) )
            .insertBefore(this.$el);

        // note: there will be two 'shows':
        // - the loading view (title = undefined)
        // - the actual module (title = data-title)
        this.leftRegion.on( 'show', function() {
            console.log('left column show');
            var title = this.$el.children('.module').data('title');
            if( title ) {
                leftTab.text( title );
            }
        });

        this.rightRegion.on( 'show', function() {
            console.log('right column show');
            var title = this.$el.children('.module').data('title');
            if( title ) {
                rightTab.text( title );
            }
        });

        leftTab.on( 'all', function(e) {
            console.log(e);
        });

        leftTab.on( 'click', function( e ) {
            $(e.target).addClass('active').siblings().removeClass('active');
            this.leftRegion.$el.show();
            this.rightRegion.$el.hide();
        }.bind(this));

        rightTab.on( 'click', function( e ) {
            $(e.target).addClass('active').siblings().removeClass('active');
            this.leftRegion.$el.hide();
            this.rightRegion.$el.show();
        }.bind(this));
    }

});