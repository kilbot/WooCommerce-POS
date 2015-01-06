_.extend( FilteredCollection.prototype, {

    query: function( query, label ){
        label = label || 'search';
        var criterion = POS.Components.SearchParser.channel.request( 'facets', query );

        // syphon off special cases
        this.checkCriterion( criterion );
        console.log(criterion);
        this.filterBy( label,
            //_.bind( collection.matchMaker, collection, criterion, fields )
            _.partial( this.matchMaker, criterion )
        );
    },

    matchMaker: function( criterion, model ){

        return _.all( criterion, function( array, key ) {

            if( key === '' ) {
                return _.all( array, function( value ) {
                    var attributes = _.pick( model.attributes, model.fields );
                    return _.any( _.values( attributes ), function( attribute ) {
                        return attribute.toLowerCase().indexOf( value ) !== -1;
                    });
                });
            }

            // special shorthand for category
            else if( key === 'cat' ) {
                return _.any( array, function( value ) {
                    var categories = _( model.get('categories') ).map( function( category ) {
                        return category.toLowerCase();
                    });
                    return _( categories ).contains( value );
                });
            }

            // match any attribute
            else if( _( model.attributes ).has( key ) ) {

                // if attribute is array, return any match
                if( _( model.get( key ) ).isArray() ) {
                    return _.any( array, function( value ) {
                        var arr = _( model.get( key ) ).map( function( value ) {
                            return value;
                        });
                        return _( arr ).contains( value );
                    });
                }

                // else match as string
                else {
                    return _.any( array, function( value ) {
                        return model.get( key ).toString().toLowerCase() === value;
                    });
                }
            }

            return false;

        }, this);

    },

    checkCriterion: function(criterion){

        // special cases for product search
        if( this.superset() instanceof POS.Entities.Products ){

            if( _(criterion).has('parent') ){
                this.removeFilter('hideVariations');
                criterion.type = ['variation'];
            } else {
                this.hideVariations();
            }

            if( _( criterion ).has( 'barcode' ) ){
                this.barcodeSearch( criterion.barcode );
            }
        }
    },

    hideVariations: function(){
        this.filterBy( 'hideVariations', function( model ){
            return model.get('type') !== 'variation';
        });
    },

    barcodeSearch: function( barcode ) {
        var filteredVariations = [];

        //filteredProducts = products.filter( function(product){
        //    if( product.get('type') === 'variable' ) {
        //        _( product.get('variations') ).each( function(variation) {
        //            if( variation.barcode.toLowerCase() === query.toLowerCase() ) {
        //                variation['type'] = 'variation';
        //                variation['title'] = product.get('title');
        //                variation['categories'] = product.get('categories');
        //                var model = new Entities.Product( variation );
        //                filteredVariations.push( model );
        //            }
        //        })
        //    }
        //    return product.get( 'barcode' ).toLowerCase() === query.toLowerCase();
        //}, this);
        //
        //products = filteredProducts.concat(filteredVariations);
        //if(POS.debug) console.log('found ' + products.length + ' products');
        //
        //// add product to cart and reset search field
        //if( products.length === 1 && products[0].get('type') !== 'variable' ){
        //    if(POS.debug) console.log('adding ' + products[0].get('title') + ' to cart');
        //    POS.CartApp.channel.command( 'cart:add', products[0] );
        //    POS.ProductsApp.channel.command( 'clear:filter' );
        //}

    }

});