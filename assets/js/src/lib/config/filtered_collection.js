_.extend( FilteredCollection.prototype, {

    matchMaker: function( criterion, fields, model ){

        return _.all( criterion, function( array, key ) {

            if( key === '' ) {
                return _.all( array, function( value ) {
                    var attributes = _.pick( model.attributes, fields );
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

    }

});