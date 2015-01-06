POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Product = Backbone.DualModel.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id',

        // this is an array of fields used by FilterCollection.matchmaker()
        fields: ['title'],

        parse: function (resp, options) {
            if( resp.product ){
                if( resp.product.type === 'variable' ) {
                    this.serverResponse(resp);
                }
                return resp.product;
            } else {
                return resp;
            }
        },

        serverResponse: function(resp){
            _.each( resp.product.variations, function( variation ){
                variation.type      = 'variation';
                variation.title     = resp.product.title;
                variation.parent    = resp.product.id;
                variation.categories= resp.product.categories;
                resp.product.push( variation );
            });
        }
    });

});