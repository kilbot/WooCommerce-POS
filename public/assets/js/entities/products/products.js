define([
	'app', 
	'paginator', 
	'entities/products/db', 
	'entities/products/product',
	'entities/products/filter',
], function(
	POS,
	PageableCollection
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Products = Backbone.PageableCollection.extend({
			database: Entities.DB,
			storeName: 'products',
			model: Entities.Product,
			mode: 'client',

			state: {
				pageSize: 5,
			},
			
			initialize: function(models, options) {
				// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				// debugging on IndexedDB adapter
				if(POS.debug) Entities.DB.nolog = false;
			},


			/**
			 * Syncing with server
			 */
			serverSync: function() {
				var self = this;
				
				// make sure a sync is not already in progress
				if( POS.request('options:get', '_syncing') ) { 
					if(POS.debug) console.log('[notice] Sync already in progress');
					return; 
				}

				// start the sync
				POS.execute('options:set', '_syncing', 1);
				$('#products-pagination').addClass('working');

				// audit and update products
				$.when( this._auditProducts(), this._updateProducts() )
				.done( function() {
					if(POS.debug) console.log('[notice] Product audit & update done');
				})
				.fail( function() {
					if(POS.debug) console.log('[error] Product audit & update failed');
				})
				.always( function() {
					POS.execute('options:set', 'last_update', Date.now() );
					POS.execute('options:delete', '_syncing');
					self.trigger('sync'); // trigger sync to time display
					$('#products-pagination').removeClass('working');
				});

			},

			// web worker to get updated products
			_updateProducts: function() {
				var worker = new Worker( POS.request('params:get', 'worker') ),
					defer = $.Deferred(),
					self = this;

				// add listener to worker
				worker.addEventListener('message', function(e) {
					var status = e.data.status;

					switch (status) {
						case 'notice':
							if(POS.debug) console.log('[notice] ' + e.data.msg);
						break;
						case 'error':
							if(POS.debug) console.log('[error] ' + e.data.msg);
						break;
						case 'modal':
							POS.execute('products:download:modal', 'download-progress', { total: e.data.total } );
						break;
						case 'products':
							$.when( self._saveProducts( e.data.products ) )
							.done( function() {
								// update progress
								if( e.data.total > 0 ) {
									POS.vent.trigger( 'update:progress', e.data.progress );
								}
								
								// complete
								if( e.data.progress === e.data.total ) {
									if(POS.debug) console.log('[notice] ' + e.data.total + ' products saved in total');
									worker.postMessage({ 'cmd': 'stop' });
									defer.resolve();
								}
							});
						break;
						default:
							// ?
					}

				}, false);

				// format the last-update and start the worker
				var updated_at_min = this._formatLastUpdateFilter( POS.request('options:get', 'last_update') );
				worker.postMessage({ 
					'cmd': 'update', 
					'last_update': updated_at_min, 
					'wc_api_url': pos_params.wc_api_url 
				});

				// return promise
				return defer.promise();
			},

			// Check local product ids against a the server
			_auditProducts: function() {
				var self = this;
				var local_ids = this.fullCollection.pluck('id');
				if(POS.debug) console.log('[notice] ' + local_ids.length + ' products stored locally');

				var defer = $.Deferred();

				// get ids from server
				$.when( this._getServerIds() )

				// then compare against local ids
				.then( function( server_ids ) {

					if(POS.debug) console.log('[notice] ' + server_ids.length + ' products stored on server');

				 	var diff = _.difference( local_ids, server_ids );
				 	if( diff.length > 0 ) {
						return self._removeProducts( diff );
				 	} else {
				 		if(POS.debug) console.log('[notice] 0 products need to be removed');
				 		return;
				 	}
				}, function() {
					if(POS.debug) console.log('[error] Failed to get product ids from server');
				})

				// resolve when done
				.done( function() {
					if(POS.debug) console.log('[notice] Product audit complete');
				})
				.fail( function() {
					if(POS.debug) console.log('[error] Product audit failed');
				})
				.always( function() {
					defer.resolve();
				});
				
				return defer.promise();
			},

			// Gets array of all product ids via ajax
			_getServerIds: function() {

				var product_ids = $.getJSON( 
					POS.request('params:get', 'ajax_url'), 
					{ 
						'action': 'pos_get_product_ids',
						'security': POS.request('params:get', 'nonce'),
						'pos': 1
					}
				);

				return product_ids;
			},

			/**
			 * Remove products from the local database
			 * @param  array product ids
			 * @return null
			 */
			_removeProducts: function(ids) {

				_.each( ids, function(id) {
					var model = this.fullCollection.get(id);
					model.destroy();
				}, this);

				if(POS.debug) console.log('[notice] ' + ids.length + ' products removed');

				return;

			},

			/**
			 * Store products
			 */
			_saveProducts: function(products) {
				var self = this,
					i = 0;

				var defer = $.Deferred();

				(function putNext(){

					// save each product
					if( i < products.length ) {
						var product = products[i];

						self.fullCollection.create( product, {
							merge: true,
							silent: true, // reset after loop
							success: putNext,
							error: function(model, response) {
								if(POS.debug) console.log('[notice] error saving product: ' + response.title);
							}
						});
						i++;
					}

					// update progress when finished
					else {
						if(POS.debug) console.log('[notice] ' + products.length + ' products saved');
						self.trigger('sync');
						defer.resolve();
					}

				})();

				return defer.promise();

			},

			/*
			 * Helper function to format the last_update timestamp to 
			 * updated_at_min as required by WC REST API
			 * TODO: move to common helper functions
			 */
			_formatLastUpdateFilter: function(timestamp) {
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
			}

		});

	});

	return;
});