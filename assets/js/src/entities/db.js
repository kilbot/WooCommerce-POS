POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.DB = {
        id: 'woocommerce-pos',
        description: 'Local cache for WooCommerce POS',
        debug: false,
        migrations : [
            {
                version: '1',
                migrate: function(db) {
                    if(!db.objectStoreNames.contains('products')) {
                        db.createObjectStore('products', { keyPath: 'id' });
                    }
                }
            },
            {
                version: '2',
                migrate: function(db) {
                    if(!db.objectStoreNames.contains('orders')) {
                        db.createObjectStore('orders', { keyPath: 'id' });
                    }
                }
            },
        ]
    };

});