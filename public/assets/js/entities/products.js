define(['app', 
	'entities/products/product', 
	'entities/products/products', 
	'entities/products/product_variations',
	'entities/products/fallback/product', 
	'entities/products/fallback/products', 
	'entities/products/fallback/product_variations'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		var API = {

			getProductEntities: function() {
				if(Modernizr.indexeddb) {
					var products = new Entities.ProductCollection();
					products.fetch({
						success: function(data, models) {
							// console.log(data);
							data.filterCollection = data.fullCollection.clone();
						},
						error: function(data) {
							// console.log(data);
						}
					});
					return products; // returns promise
				}

				// fallback for no IndexedDB
				else {
					return this.getFallbackProductEntities();
				}
			},

			getProductVariations: function(model){
				if(Modernizr.indexeddb) {
					return new Entities.VariationsCollection(model.get('variations'), model);
				}

				// fallback for no IndexedDB
				else {
					return this.getFallbackProductVariations();
				}
			},

			getFallbackProductEntities: function() {
				var products = new Entities.FallbackProductCollection();

				var defer = $.Deferred();
				products.fetch({
					success: function(data) {
						defer.resolve(data);
					}
				});

				return defer.promise();
			},

			getFallbackProductEntity: function(productId){
				var product = new Entities.FallbackProduct({ id: productId });

				var defer = $.Deferred();
				products.fetch({
					success: function(data) {
						defer.resolve(data);
					},
					error: function(data) {
						defer.resolve(undefined);
					}
				});

				return defer.promise();
			},

			getFallbackProductVariations: function(model){
				return new Entities.FallbackVariationsCollection(model.get('variations'), model);
			},

			syncProducts: function() {
				_startWorker();
			},



		};

		POS.reqres.setHandler('product:entities', function() {
			return API.getProductEntities();
		});

		POS.reqres.setHandler('product:variations', function(model) {
			return API.getProductVariations(model);
		});

		POS.commands.setHandler('product:sync', function() {
			return API.syncProducts();
		});


		/**
		 * Server Sync
		 */
		
		var _startWorker = function() {
			var self = this;
			var worker = new Worker( pos_params.worker );

			worker.addEventListener('message', function(e) {
				_workerEvents( e.data );
			}, false);

			// format the last-update and send to worker
			var updated_at_min = _formatLastUpdateFilter( POS.request('options:get', 'last_update') );
			worker.postMessage({ 'cmd': 'sync', 'last_update': updated_at_min, 'wc_api_url': pos_params.wc_api_url });

		};

		/**
		 * Worker events handler
		 */
		var _workerEvents = function( data ) {
			var status = data.status;

			switch (status) {
				case 'progress':
					console.log(data.count);
				break;
				case 'error':
					console.log(data.msg);
				break;
				case 'complete':
					console.log(data.msg);
				break;
				case 'showModal': 
					console.log(data.type);
					console.log(data.total);
				break;

				// special case for Firefox, no access to IndexedDB from Web Worker :(
				case 'noIndexedDB':
					this._saveProducts(data.products, data.progress, data.count);
				break;
				default:
					// ?
			}
		};

		/*
		 * Helper function to format the last_update timestamp to 
		 * updated_at_min as required by WC REST API
		 */
		var _formatLastUpdateFilter = function(timestamp) {
			var last_update = new Date( parseInt(timestamp) );

			function leadingZero(value){
				if(value < 10){
					return "0" + value.toString();
				}
				return value.toString();    
			}

			// test for valid timestamps
			if(last_update.getTime() > 0) {
				var year 	= last_update.getUTCFullYear();
		        var month 	= leadingZero( last_update.getUTCMonth() + 1 ); // starts month at 0
		        var date 	= leadingZero( last_update.getUTCDate() );
		        var hours 	= leadingZero( last_update.getUTCHours() );
		        var mins 	= leadingZero( last_update.getUTCMinutes() );
		        var secs 	= leadingZero( last_update.getUTCSeconds() );

		        return year + '-' + month + '-' + date + 'T' + hours + ':' + mins + ':' + secs + 'Z';
			} else {
				return null;
			}
		};

	});

	return;
});