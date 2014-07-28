define(['app', 
	'entities/products/tabs', 
	'entities/products/product', 
	'entities/products/products', 
	'entities/products/product_variations',
	'entities/products/fallback/product', 
	'entities/products/fallback/products', 
	'entities/products/fallback/product_variations'
], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		var API = {

			getProductEntities: function() {
				if(Modernizr.indexeddb) {
					var products = new Entities.ProductCollection();

					// bootstrap from indexeddb, store full collection
					products.fetch({
						success: function(data, models) {
							// console.log(data);
							data.productDatabase = data.fullCollection.clone();
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

			syncProducts: function() {

				var self = this;

				$('#pagination').addClass('working');

				// first audit the products, delete any that have been removed from the server
				_auditProducts()
				.then( function( productArray ) {
					if( productArray.length > 0 ) { 
						return self.removeProducts( productArray ); 
					}
				})

				// then: start the web worker sync
				.then( function(){

					self.startWorker();
				});

			},

		};

		/**
		 * Handlers
		 */
		POS.reqres.setHandler('product:entities', function() {
			return API.getProductEntities();
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
					POS.execute('options:set', 'last_update', Date.now() );
					$('#pagination').removeClass('working');
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

		/**
		 * Check local product ids against a the server
		 * @return promise, then array of ids
		 */
		var _auditProducts = function() {
			var self = this;

			// get list of product ids from the server
			return $.getJSON( pos_params.ajax_url , { 'action' : 'pos_get_product_ids' } )
			.then( function( sids ) {
				if (sids instanceof Array) {  
					// build an array of ids stored locally
					var models = self.fullCollection.models;
					var lids = [];
					for (var i = 0; i < models.length; i++) {
						lids.push(models[i].id);
					}

					// use underscore method to check difference
					var diff = _.difference(lids, sids);
					console.log(diff.length + ' products need to be deleted');
					return diff;

				} else {
					console.log('server response is no good');
				}

			}, function(jqXHR, textStatus, errorThrown) {
				console.log('error ' + textStatus);
				console.log('incoming Text ' + jqXHR.responseText);
				alert(errorThrown);
			});
		};

		/**
		 * Remove the products the local database
		 * @param  array expects and array of product ids
		 * @return null
		 */
		var _removeProducts = function(models) {
			if (models instanceof Array) { 

				for (var i = 0; i < models.length; i++) {
					var model = this.fullCollection.get(models[i]);
					var jqxhr = model.destroy();
					this.remove(model);
				}
				console.log(i + ' products removed');
			}
		};

		/**
		 * Fallback function for Firefox
		 */
		var _saveProducts = function( products, progress, count ) {
			var self = this,
				i = 0;

			(function putNext(){

				// save each product
				if( i < products.length ) {
					self.fullCollection.create( products[i], {
						merge: true,
						silent: true,
						success: putNext,
						error: function(model, response) {
							console.log('error saving model: ' + response.title);
						}
					});
					i++;
				}

				// then update progress
				else {
					var storeCount = progress + i;
					self.workerEvents({ status: 'progress', count: storeCount });
					if( storeCount === count ) {
						self.workerEvents({ status: 'complete', msg: 'Sync complete!' });
					}
					return;
				}
			})();

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