POS.wc_api = '/wc-api/v2/';
POS.debug = true;

var DB = {
    id: 'test',
    debug: true,
    migrations : [
        {
            version: '1',
            migrate: function(db) {
                if(!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'id' });
                }
            }
        }
    ]
};

describe('Backbone.sync for cached entities', function() {

    beforeEach(function() {
        indexedDB.deleteDatabase('test');
    });

    describe('basic persistence', function () {
        describe('online operations cached for offline use', function () {
            describe('Model.fetch', function () {

                it('stores the result locally after fetch', function (done) {
                    this.timeout(3000);
                    var product = new POS.Entities.Product({ id: 96 });
                    product.database = DB;
                    product.fetch({
                        success: function(entity, response, options) {
                            console.log(response);
                            return done();
                        },
                        error: function(entity, response, options) {
                            console.error(response.status);
                            return done();
                        }
                    });

                });

            });

        });

    });

});