define(['jquery', 'underscore', 'backbone', 'backbone-paginator', 'models/Product', 'settings', 'db/ProductsDB'], 
	function($, _, Backbone, PageableCollection, Product, Settings, Database){
	
	// the pageable product list
	var Products = Backbone.PageableCollection.extend({
		database: Database,
		storeName: 'products',
		model: Product,
		mode: 'client',
		params: pos_params,

		state: {
			pageSize: 5,
			totalRecords: null,
			sortKey: "updated_at",
    		order: 1
  		},

		initialize: function() {
			// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug
		},

		/**
		 * Sync the local database with the server
		 * TODO: improve product audit, maybe move to worker?
		 */
		serverSync: function() {
			var self = this;

			$('#pagination').addClass('working');

			// first audit the products, delete any that have been removed from the server
			this.auditProducts()
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

		/**
		 * Clear the database
		 */
		clear: function() {
			var self = this;

			// Danger! This call should never go out to the server. It's not a problem at
			// the moment but checks and balances should be added if WC REST API allows delete
			Backbone.sync('delete', this, {
				success: function() {
					self.fullCollection.reset();
					Settings.set( 'last_update', null );
				},
				error: function() {
					alert('There was a problem clearing the database');
				}
			});
		},

		/**
		 * Start the product sync in the background
		 */
		startWorker: function() {
			var self = this;

			// start a web worker
			var worker = new Worker( this.params.worker );

			worker.addEventListener('message', function(e) {
				var status = e.data.status;

				switch (status) {
					case 'success':
						console.log(e.data.msg);
						self.fetch();
					break;
					case 'error':
						alert(e.data.msg);
					break;
					case 'complete':
						console.log(e.data.msg);
						Settings.set( 'last_update', Date.now() );
						$('#pagination').removeClass('working');
					break;
					default:
						// ?
				}

			}, false);

			// format the last-update and send to worker
			var updated_at_min = this.formatLastUpdateFilter( Settings.get('last_update') );
			worker.postMessage({ 'cmd': 'sync', 'last_update': updated_at_min, 'ajax_url': this.params.ajax_url });
		},

		/**
		 * Check local product ids against a the server
		 * @return promise, then array of ids
		 */
		auditProducts: function() {
			var that = this;

			// get list of product ids from the server
			return $.getJSON( this.params.ajax_url , { 'action' : 'pos_get_product_ids' } )
			.then( function( sids ) {
				if (sids instanceof Array) {  
					// build an array of ids stored locally
					var models = that.fullCollection.models;
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
		},

		/**
		 * Remove the products the local database
		 * @param  array expects and array of product ids
		 * @return null
		 */
		removeProducts: function(models) {
			if (models instanceof Array) { 

				for (var i = 0; i < models.length; i++) {
					var model = this.fullCollection.get(models[i]);
					var jqxhr = model.destroy();
					this.remove(model);
				}
				console.log(i + ' products removed');
			}
		},

		/*
		 * Helper function to format the last_update timestamp to 
		 * updated_at_min as required by WC REST API
		 */
		formatLastUpdateFilter: function(timestamp) {
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
		},

	});

	// You don't usually return a collection instantiated
  	return Products;

});