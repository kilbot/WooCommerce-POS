POS.module('Entities.Orders', function(Orders, POS, Backbone, Marionette, $, _){

    Orders.Model = Backbone.DualModel.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id',

        defaults: {
            note: ''
        }
    });

});