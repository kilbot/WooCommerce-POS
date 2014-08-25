define([
	'app', 
	'paginator', 
	'entities/products/db', 
	'entities/products/product'
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
				this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug

				this.options = options || (options = {});

				this.filterCollection = Entities.channel.request('product:filtercollection', options);

				// init filterCollection
				this.once('sync', function () {
					this.filterCollection.reset( this.fullCollection.models );
				});

				// update filterCollection after serverSync
				this.on('update:filter:collection', function() {
					this.filterCollection.reset( this.fullCollection.models );
					this.filterCollection._filterProducts(); // honor active filters
				});

				// update fullCollection with filterCollection
				this.listenTo( this.filterCollection, 'filter:products', function (collection, options){
					this.fullCollection.reset(collection);
				});

				Entities.channel.comply('product:sync', this.serverSync, this );

				// debugging on IndexedDB adapter
				if(POS.debug) Entities.DB.nolog = false;
			},

			/**
			 * Syncing with server
			 */
			serverSync: function() {
				var self = this;

				// make sure a sync is not already in progress
				if( POS.Entities.channel.request('options:get', '_syncing') ) { 
					if(POS.debug) console.warn('Sync already in progress');
					return; 
				}

				// fullcollection may be filtered, so reset before syncing
				this.fullCollection.reset( this.filterCollection.models, { silent: true });

				// start the sync
				POS.Entities.channel.command('options:set', '_syncing', 1);
				$('#products-pagination').addClass('working');

				// audit and update products
				$.when( this._auditProducts(), this._updateProducts() )
				.done( function() {
					if(POS.debug) console.log('Product audit & update done');
				})
				.fail( function() {
					if(POS.debug) console.warn('Product audit & update failed');
				})
				.always( function() {
					self.trigger('update:filter:collection');
					POS.Entities.channel.command('options:set', 'last_update', Date.now() );
					POS.Entities.channel.command('options:delete', '_syncing');
					$('#products-pagination').removeClass('working');
				});

			},

			destroy: function() {
				var self = this,
					ids = this.fullCollection.pluck('id');
				$.when( this._removeProducts(ids) ).done( function() {
					self.fullCollection.reset();
				});
			},

			// web worker to get updated products
			_updateProducts: function() {
				var worker = new Worker( pos_params.worker ),
					defer = $.Deferred(),
					self = this;

				// add listener to worker
				worker.addEventListener('message', function(e) {
					var status = e.data.status;

					switch (status) {
						case 'notice':
							if(POS.debug) console.log(e.data.msg);
						break;
						case 'error':
							if(POS.debug) console.warn(e.data.msg);
						break;
						case 'modal':
							POS.ProductsApp.channel.command('show:download:progress', { total: e.data.total } );
						break;
						case 'products':
							$.when( self._saveProducts( e.data.products ) )
							.done( function() {
								// update progress
								if( e.data.total > 0 ) {
									POS.Components.ProgressBar.channel.trigger( 'update:progress', e.data.progress );
								}
								
								// complete
								if( e.data.progress === e.data.total ) {
									if(POS.debug) console.log(e.data.total + ' products saved in total');
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
				var updated_at_min = this._formatLastUpdateFilter( POS.Entities.channel.request('options:get', 'last_update') );
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
				if(POS.debug) console.log(local_ids.length + ' products stored locally');

				var defer = $.Deferred();

				// get ids from server
				$.when( this._getServerIds() )

				// then compare against local ids
				.then( function( server_ids ) {

					if(POS.debug) console.log(server_ids.length + ' products stored on server');

				 	var diff = _.difference( local_ids, server_ids );
				 	
				 	if( diff.length > 0 ) {
				 		return $.when( self._removeProducts( diff ) );
				 	} else {
				 		if(POS.debug) console.log('0 products need to be removed');
				 		return;
				 	}
				}, function() {
					if(POS.debug) console.warn('[error] Failed to get product ids from server');
				})

				// resolve when done
				.done( function() {
					if(POS.debug) console.log('Product audit complete');
				})
				.fail( function() {
					if(POS.debug) console.warn('Product audit failed');
				})
				.always( function() {
					defer.resolve();
				});
				
				return defer.promise();
			},

			// Gets array of all product ids via ajax
			_getServerIds: function() {

				var product_ids = $.getJSON( 
					pos_params.ajax_url, 
					{ 
						'action': 'pos_get_product_ids',
						'security': pos_params.nonce,
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
				var defer = $.Deferred();

				_.each( ids, function(id, index) {
					var model = this.fullCollection.get(id);
					model.destroy({
						silent: true,
						success: function() {
							if( ( index + 1 ) === ids.length ) {
								if(POS.debug) console.log(ids.length + ' products removed');
								defer.resolve();
							}
						},
						error: function(model, response) {
							if(POS.debug) console.warn('problem deleting ' + response.title);
							defer.resolve();
						}
					});
				}, this);

				return defer.promise();
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
								if(POS.debug) console.warn('error saving product: ' + response.title);
							}
						});
						i++;
					}

					// update progress when finished
					else {
						if(POS.debug) console.log(products.length + ' products saved');
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