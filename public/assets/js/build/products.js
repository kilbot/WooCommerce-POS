/**
 * 1. Sync server products to local IndexedDB
 * 2. Display products
 */

(function ( $ ) {
	'use strict';


	/*============================================================================
	 IndexedDB
	 ===========================================================================*/ 

	// the datbase object
	var database = {
		id: 'productsDB',
		description: 'Products database',
		migrations : [{
			version: "1.0",
			migrate: function(transaction , next) {
				var store;
				if(!transaction.db.objectStoreNames.contains( 'products' )){
					store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
				}
				store = transaction.objectStore( 'products' );
				store.createIndex( 'titleIndex', 'title', { unique: false} );
				next();
			}
		}]
	};


	/*============================================================================
	 Products List
	 ===========================================================================*/

	// storage for the product data
	var Product = Backbone.Model.extend({
		database: database,
		storeName: 'products',

		// debug
		initialize: function() { this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); },
	});

	// the pageable product list
	var Products = Backbone.PageableCollection.extend({
		database: database,
		storeName: 'products',
		model: Product,
		mode: 'client',

		state: {
			pageSize: 5,
			totalRecords: null,
			sortKey: "updated_at",
    		order: 1
  		},

  		// debug
		initialize: function() { 
			this.on('all', function(e) { console.log("Product Collection event: " + e); }); 
		},

	});
	
	// init the product list and make available elsewhere
	var products = new Products();

	// view for individual products
	var ProductView = Backbone.View.extend({
		tagName : 'tr',
		model: new Product(),
		template: _.template($('#tmpl-product').html()),

		events: {
			'click a.add-to-cart'	: 'addToCart',
		},

		initialize: function() {
			this.model.on('all', function(e) { console.log("Product View event: " + e); }); // debug
		},

		render: function() {
			var item = this.model.toJSON();
			console.log(item);
			this.$el.html( ( this.template( item ) ) );
			return this;
		},

		addToCart: function(e) {
			e.preventDefault();
			// send to the cart
			mediator.publish("addToCart", this.model);
		},

	});

	// pageable view for the entire list
	var ProductListView = Backbone.View.extend({
		el: $('#product-list'),
		model: products,
		elEmpty: $('#product-list').contents().clone(),

		initialize: function() {
			this.model.on('all', function(e) { console.log("Product List event: " + e); }); // debug
			this.model.on( 'all', this.render, this );

			// get products from indexedDB (if any)
			products.fetch().done( function() {
				console.log( 'init collection with ' + products.length + ' products from indexedDB' );
			});

			// sync products with the server on page load
			productSync();

		},

		render: function() {
			console.log('render the products'); // debug

			// if empty, add empty message
			if( products.length === 0 ) {
				this.emptyMessage();

			// Else, clear the view ready for new products
			} else {
				this.$el.removeClass('empty').html('');
			}

			// Loop through the collection
			products.each(function( item ){

				// Render each item model into this List view
				var newProduct = new ProductView({ model : item });
				this.$el.append( newProduct.render().el );

			// Pass this list views context
			}, this);

		},

		emptyMessage: function() {
			this.$el.addClass('empty').html(this.elEmpty);
		},

	});

	// show the list of Products
	var productListView = new ProductListView();


	/*============================================================================
	 Product Filter
	 borrows heavily from backgrid-filter.js
	 ===========================================================================*/ 

	// view attaches to the search field
	var ProductFilter = Backbone.View.extend({
		el: $('#filter'),
		collection: products,
		fields: ['title'],
		events: {
			'keydown input[type=search]': 'search',
			'submit'		: 'search',
			'click a.clear'	: 'clear',
		},
		wait: 149,

		initialize: function (options) {

			this._debounceMethods(["search", "clear"]);

			var collection = this.collection = this.collection.fullCollection || this.collection;
			var shadowCollection = this.shadowCollection = collection.clone();

			this.listenTo(collection, "add", function (model, collection, options) {
				shadowCollection.add(model, options);
			});
			this.listenTo(collection, "remove", function (model, collection, options) {
				shadowCollection.remove(model, options);
			});
			this.listenTo(collection, "sort", function (col) {
				if (!this.searchBox().val()) { shadowCollection.reset(col.models); }
			});
			this.listenTo(collection, "reset", function (col, options) {
				options = _.extend({reindex: true}, options || {});
				if (options.reindex && options.from == null && options.to == null) {
					shadowCollection.reset(col.models);
				}
			});
		},

		_debounceMethods: function (methodNames) {
			if (_.isString(methodNames)) { methodNames = [methodNames]; }

			this.undelegateEvents();

			for (var i = 0, l = methodNames.length; i < l; i++) {
				var methodName = methodNames[i];
				var method = this[methodName];
				this[methodName] = _.debounce(method, this.wait);
			}

			this.delegateEvents();
		},

		makeRegExp: function (query) {
      		return new RegExp(query.trim().split(/\s+/).join("|"), "i");
    	},

    	makeMatcher: function (query) {
			var regexp = this.makeRegExp(query);
			return function (model) {
				var keys = this.fields || model.keys();
				for (var i = 0, l = keys.length; i < l; i++) {
					if (regexp.test(model.get(keys[i]) + "")) { return true; }
				}
				return false;
			};
		},

		searchBox: function () {
			return this.$el.find("input[type=search]");
		},

		search: function (e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.showClearButtonMaybe();
			var matcher = _.bind(this.makeMatcher(this.searchBox().val()), this);
			var col = this.collection;
			if (col.pageableCollection) { col.pageableCollection.getFirstPage({silent: true}); }
			col.reset(this.shadowCollection.filter(matcher), {reindex: false});
		},

		clearButton: function () {
			return this.$el.find("a.clear");
		},

		clear: function (e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.clearSearchBox();
			var col = this.collection;
			if (col.pageableCollection) { col.pageableCollection.getFirstPage({silent: true}); }
			col.reset(this.shadowCollection.models, {reindex: false});
		},

		clearSearchBox: function() {
			this.value = null;
			this.searchBox().val(null);
			this.showClearButtonMaybe();
		},

		showClearButtonMaybe: function () {
			var $clearButton = this.clearButton();
			var searchTerms = this.searchBox().val();
			if (searchTerms) { $clearButton.show(); }
			else { $clearButton.hide(); }
		},

	});

	var productFilter = new ProductFilter();


	/*============================================================================
	 Product Pagination
	 ===========================================================================*/
	
	// view handles the pagination and page info
	var ProductPagination = Backbone.View.extend({
		el: $('#pagination'),
		template: _.template($('#tmpl-pagination').html()),

		initialize: function() {

			products.on( 'all', this.render, this );
			this.render();
		},
	
		events: {
			'click a.prev'		: 'previous',
			'click a.next'		: 'next',
			'click a.sync'		: 'sync',
			'click a.destroy'	: 'destroy',
		},
		
		render: function() {

			// get data from the products collection
			var state = products.state;
			state.currentRecords = products.length;

			// add the last updated time from localstorage
			var last_update = new Date( +getPosMeta( 'last_update' ) );
			state.last_update = last_update.getTime() > 0 ? last_update.toLocaleTimeString() : 'never' ;
			
			// now render
			this.$el.html( ( this.template( state ) ) );
			this.$el.prepend( '<span></span> ' ); // add a span for 'working' animation
			return this;
		},

		previous: function() {
			if(products.hasPreviousPage()) {
				products.getPreviousPage();
			}
			return false;
		},

		next: function() {
			if(products.hasNextPage()) {
				products.getNextPage();
			}
			return false;
		},

		sync: function() {
			productSync(); // go get the products
			return false;
		},

		destroy: function() {
			products.reset(); // clear the collection
			deleteDB(database); // delete the database
			setPosMeta( 'last_update', null ); // clear the last update time
			products.fetch(); // re-init the database with 0 records
			return false;
		},
	});

	var productPagination = new ProductPagination();


	/*============================================================================
	 Server Sync
	 1. get a list of all product ids from server
	 2. check against ids in local db
	 3. remove any products not on the server
	 4. check for updates since last_update
	 5. download products
	 6. set updated products in local db

	 TODO: chain an id audit on the end of the server sync to catch any problems
	 closeSync() should fire always but errors need to display somewhere
	 updated_at_min only takes 2014-04-04 can we go down to minutes, seconds?
	 also need to look into server time versus local browser time, poss conflict
	 ===========================================================================*/ 
	
	function productSync() {

		$('#pagination').addClass('working');

		var deleteComplete = false, 
			saveComplete = false;

		// audit products, returns an array of products to be deleted
		// then: remove the products (if any)
		// then: we're done
		auditProducts()
		.then( function( productArray ) {
			if( productArray.length > 0 ) { 
				return removeProducts( productArray ); 
			}
		})
		.then( function(){
			deleteComplete = true;
			closeSync( deleteComplete, saveComplete );
		});


		// get the number of products changed since last update
		// then: queue the ajax calls to get updated products
		// then: we're done
		
		var updated_at_min = formatLastUpdateFilter( getPosMeta( 'last_update' ) );

		getUpdatedCount( updated_at_min )
		.then( function( count ) {
			if ( count > 0 ) { 

				// if we need less than 10, get less than 10
				// if we need more than 10, get limit of 10 at a time
				var limit = ( count < 100 ) ? count : 100 ;

				// queue the products to update
				// calls to server will be asynchronous
				// saving happens synchronous to each call
				return queueProducts( count, limit, updated_at_min );

			}
		})
		.then( function(){
			saveComplete = true;
			closeSync( deleteComplete, saveComplete );
		});

	}

	/**
	 * Get a number of products about to be returned
	 * @param  int updated_at_min
	 * @return promise, then int count
	 */
	function getUpdatedCount(updated_at_min) {

		// updated at min should be value like 2014-05-14 or null
		updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

		// get count of products updated from the server
		return $.getJSON( '/wc-api/v1/products/count', { 'filter[updated_at_min]': updated_at_min } )
		.then( function( response ) {
			console.log(response.count + ' products need to be updated');
			return response.count;
		}, function (jqXHR, textStatus, errorThrown) {
			console.log('error ' + textStatus);
			console.log('incoming Text ' + jqXHR.responseText);
			alert(errorThrown);
		});
	}


	/**
	 * This breaks the product requests into manageable chunks for
	 * the server. If a store has 1,000's of products the REST API 
	 * will timeout. This is a bit of a work around.
	 *
	 * Returns a promise which resolves when all products are 
	 * downloaded and saved.
	 * 
	 * @param  int count, limit, updated_at_min
	 * @return promise
	 */
	function queueProducts(count, limit, updated_at_min) {

		// default values
		count = typeof count !== 'undefined' ? count : 10; // default count is 10
		limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
		updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;		
		
		var requests = [];
		for (var offset = 0; offset < count; offset += limit) {
			requests.push(
				getProducts( limit, offset, updated_at_min )
			);
		}
		console.log(requests.length + ' ajax calls queued');
		
		return $.when.apply($, requests).always(function ( data ) {
    		console.log('All products retrieved and saved');
		});
		
	}

	/**
	 * Get the products from the server, 
	 * then: save the returned products (synchronous)
	 * @param  int limit, offset, updated_at_min	filters provided by WC REST API
	 * @return promise
	 */
	function getProducts(limit, offset, updated_at_min) {
		console.log('getting ' + limit + ' products, offset by ' + offset );

		// default values
		limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
		offset = typeof offset !== 'undefined' ? offset : 0; // default offset is 0
		updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

		// make the call, save the data
		return $.getJSON( '/wc-api/v1/products/', { 'filter[limit]': limit, 'filter[offset]': offset, 'filter[updated_at_min]': updated_at_min } )
		.then( function( data ) { 
			saveProducts( data ); 
		}, function( jqXHR, textStatus, errorThrown ) {
			alert( errorThrown );
		});

	}

	/**
	 * Save products to the local database
	 * @param  JSON expects json object containing products
	 * @return null
	 */
	function saveProducts( ajaxResponse ) {
		console.log('saving ' + ajaxResponse.products.length + ' products' );

		// for each product in the WC API response
		// native js for loop performs best
		for (var i = 0; i < ajaxResponse.products.length; i++) { 

			var model = products.fullCollection.create( ajaxResponse.products[i],
				{
				merge: true,
				success: function(model, response) {
					console.log('saved: ' + response.title);
				},
				error: function(model, response) {
					console.log('error saving model: ' + response.title);
				}
			});
		}
	}

	/**
	 * Check local product ids against a the server
	 * @return promise, then array of ids
	 */
	function auditProducts() {

		// get list of product ids from the server
		return $.getJSON( pos_cart_params.ajax_url , { 'action' : 'pos_get_product_ids' } )
		.then( function( sids ) {
			if (sids instanceof Array) {  

				// build an array of ids stored locally
				var models = products.fullCollection.models;
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
	}

	/**
	 * Remove the products the local database
	 * @param  array expects and array of product ids
	 * @return null
	 */
	function removeProducts(models) {
		if (models instanceof Array) { 

			for (var i = 0; i < models.length; i++) {
				var model = products.fullCollection.get(models[i]);
				var jqxhr = model.destroy();
				products.remove(model);
			}
			console.log(i + ' products removed');
		}
	}

	/**
	 * Product Sync clean up
	 */
	function closeSync( deleteComplete, saveComplete ) {
		if(deleteComplete && saveComplete) {
			console.log( 'sync is done! ' );
			setPosMeta( 'last_update', Date.now() );
			productPagination.render();
			$('#pagination').removeClass('working');
		}
	}


	/*============================================================================
	 Helper Functions
	 ===========================================================================*/ 

	function deleteDB(dbObj) {
		try {
			// close any open connections
			products.sync( 'closeall' );

		    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB ;

			// clobber the database 
			var dbreq = indexedDB.deleteDatabase(dbObj.id);
			dbreq.onsuccess = function (event) {
				var db = event.result;
				console.log("indexedDB: " + dbObj.id + " deleted");
			};
			dbreq.onerror = function (event) {
				console.error("indexedDB.delete Error: " + event.message);
			};
			dbreq.onblocked = function (event) {
				console.error("indexedDB.delete Error: " + event.message);
			};
		}
		catch (e) {
			console.error("Error: " + e.message);
		}
	}

	function setPosMeta(key, value) {
		if ( !Modernizr.localstorage ) { return false; }
		localStorage.setItem('posMeta-' + key, value); 
		console.log('saved ' + key + ': ' + value);
		return true;
	}

	function getPosMeta(key) {
		if ( !Modernizr.localstorage ) { return false; }
		var value = localStorage.getItem('posMeta-' + key);
		// console.log('retrieved ' + key + ': ' + value);
		return value;
	}

	function formatLastUpdateFilter(timestamp) {
		var last_update = new Date(+timestamp);

		// test for valid timestamps
		if(last_update.getTime() > 0) {
			var year 	= new Date( last_update ).getFullYear();
	        var month 	= new Date( last_update ).getMonth() + 1; // starts month at 0
	        // var month 	= new Date( last_update ).getMonth(); // debug
	        var date 	= new Date( last_update ).getDate();

	        if (month < 10) {
				month = '0' + month;
			}

			if (date < 10) {
				date = '0' + date;
			}

	        return year + '-' + month + '-' + date;
		} else {
			return null;
		}
	}

}(jQuery));
