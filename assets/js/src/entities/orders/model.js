POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Order = Backbone.DualModel.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id',

        defaults: {
            note: ''
        }
    });

});