/**
 * Web Worker.
 * Performs server sync in the background.
 */

var db,
	storeCount = 0,
	wc_api_url = '/wc-api/v1/';

// number of products to get in a single ajax call
// adjust to prevent server timeouts
var ajaxLimit = 50;

addEventListener('message', function(e) {
	var data = e.data;

	switch (data.cmd) {
		case 'sync':
			if( typeof indexedDB !== 'undefined' ) {
				openDB();
			}
			if( typeof data.wc_api_url !== 'undefined' && data.wc_api_url !== '') {
				wc_api_url = data.wc_api_url;
			}
			getUpdateCount(data.last_update);
		break;
		case 'clear':
			deleteDB();
		break;
		case 'stop':
			self.postMessage({ 'status': 'complete', 'msg': 'Worker stopped: ' + data.msg });
			close(); // Terminates the worker.
		break;
		default:
			self.postMessage({ 'status': 'complete', 'msg': 'Unknown command: ' + data.cmd });
	}

}, false);

// getJSON helper function
var getJSON = function(url, successHandler, errorHandler) {
	var xhr = typeof XMLHttpRequest !== 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('get', url, true);
	xhr.onreadystatechange = function() {
		var status;
		var data;
		// http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
		if (xhr.readyState === 4) { // `DONE`
			status = xhr.status;
			if (status === 200) {
				try {
					data = JSON.parse(xhr.responseText);
					successHandler && successHandler(data);
				} catch(e) {
					errorHandler && errorHandler(e);
				}
			} else {
				errorHandler && errorHandler(status);
			}
		}
	};
	xhr.send();
};

var openDB = function() {
	var openRequest = indexedDB.open( 'productsDB' );

	openRequest.onupgradeneeded = function(e) {

		// this should produce an error
		// let the main app create the database

		console.log('Upgrading products database');

		// var thisDB = e.target.result;

		// if(!thisDB.objectStoreNames.contains( 'products' )) {
		//		 var objectStore = thisDB.createObjectStore( 'products', { keyPath: 'id' } );
		//		 objectStore.createIndex( 'titleIndex', 'title', { unique: false} );
		// }	
	};

	openRequest.onsuccess = function(e) {
		console.log('Opened products database');
		db = e.target.result;
	};

	openRequest.onerror = function(e) {
		self.postMessage({ 'status': 'error', 'msg': 'idberror' });
	};
};

var getUpdateCount = function(updated_at_min){
	// updated at min should be value like 2014-05-14 or null
	updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

	var query = [
		'filter[updated_at_min]=' + updated_at_min,
		'pos=1' 
	];	

	// get the update count
	getJSON( wc_api_url + 'products/count?' + query.join('&'), function(data) {
		if( data.count > 0 ) {
			console.log( data.count + ' products need to be updated' );
			if( data.count > ajaxLimit ) {
				self.postMessage({ 'status': 'showModal', 'type': 'downloadProgress', 'total': data.count });
			}
			getProducts( data.count, ajaxLimit, updated_at_min );
		}
		else {
			self.postMessage({ 'status': 'complete', 'msg': '0 products need to be updated' });
		}
	}, function(status) {
		self.postMessage({ 'status': 'error', 'msg': status });
	});
};

var getProducts = function(count, limit, updated_at_min) {
	// default values
	count = typeof count !== 'undefined' ? count : 10; // default count is 10
	limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
	updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;	

	var offset = 0;
	var failed = 0;
	var interval = 1000;

	// get the products
	(function getNext( offset, interval ){
		setTimeout(function(){
			var query = [
				'filter[limit]=' + limit,
				'filter[offset]=' + offset,
				'filter[updated_at_min]=' + updated_at_min,
				'pos=1' 
			];

			getJSON( wc_api_url + 'products?' + query.join('&'), function(data) {

				// get the next limit of products
				next = offset + limit;
				if( next < count ) {
					getNext( next );
				}

				// store the products
				storeProducts( data.products, count );

			}, function(status) {

				// handle the errors
				if ( 503 === status ) { // server timeout

					// recurse on 503 up to 10 times
					if( ++failed < 10 ) {
						// give the server some breathing room
						interval = interval + 1000;
						getNext( offset, interval );
					}

					// server could be down or overloaded
					else {
						self.postMessage({ 'status': 'error', 'msg': status });
					}
				}
				else if ( 401 === status ) { // 
					self.postMessage({ 'status': 'error', 'msg': status });
				}
				else {
					self.postMessage({ 'status': 'error', 'msg': 'dlerror' });
				}
			});
		}, interval);
	})( offset, interval );
};

var storeProducts = function( products, count ) {

	// if Indexeddb not available from worker
	if( typeof db !== 'object' ) {
		self.postMessage({ 'status': 'noIndexedDB', 'products': products, 'progress': storeCount, 'count': count });
		storeCount += products.length;
		return;
	}

	// prepare for database transaction
	var transaction = db.transaction( ['products'], 'readwrite' );
	var store = transaction.objectStore('products');
	var i = 0;

	(function putNext(){
		if( i < products.length ) {
			var request = store.put( products[i] );
			request.onsuccess = putNext;
			request.onerror = function(e) {
				self.postMessage({ 'status': 'error', 'msg': 'idberror' });
			};
			i++;
		}

		// complete
		else {
			storeCount += i;
			self.postMessage({ 'status': 'progress', 'count': storeCount });
			if( storeCount === count ) {
				self.postMessage({ 'status': 'complete', 'msg': 'Sync complete!' });
			}
		}
	})();
};