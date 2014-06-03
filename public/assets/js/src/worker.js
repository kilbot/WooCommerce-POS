/**
 * Web Worker.
 * Performs server sync in the background.
 */

var db,
	storeCount = 0;

// number of products to get in a single ajax call
// adjust to prevent server timeouts
var ajaxLimit = 100; 

addEventListener('message', function(e) {
	var data = e.data;

	switch (data.cmd) {
		case 'sync':
			if( typeof indexedDB !== 'undefined' ) {
				openDB();
			} 
			getUpdateCount(data.last_update);
		break;
		case 'clear':
			deleteDB();
		break;
		case 'stop':
			self.postMessage('Worker stopped: ' + data.msg);
			close(); // Terminates the worker.
		break;
		default:
			self.postMessage('Unknown command: ' + data.cmd);
	}

}, false);

// getJSON helper function
function getJSON(url, successHandler, errorHandler) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.responseType = 'json';
	xhr.onload = function() {
		var status = xhr.status;
		if (status === 200) {
			successHandler && successHandler(xhr.response);
		} else {
			errorHandler && errorHandler(status);
		}
	};
	xhr.send();
}

var openDB = function() {
	var openRequest = indexedDB.open( 'productsDB', 1 );

	openRequest.onupgradeneeded = function(e) {

		// this should produce an error
		// let the main app create the database
		console.log('Error: The database does not exist');


        // console.log('Upgrading products database');
        // var thisDB = e.target.result;

        // if(!thisDB.objectStoreNames.contains( 'products' )) {
        //     var objectStore = thisDB.createObjectStore( 'products', { keyPath: 'id' } );
        //     objectStore.createIndex( 'titleIndex', 'title', { unique: false} );
        // }	
    };

    openRequest.onsuccess = function(e) {
        console.log('Opened products database');
        db = e.target.result;
    };

    openRequest.onerror = function(e) {
        console.log('Error');
        console.dir(e);
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
	getJSON('/wc-api/v1/products/count?' + query.join('&'), function(data) {
		if( data.count > 0 ) {
			self.postMessage({ 'status': 'success', 'msg': data.count + ' products need to be updated' });
			queueProducts( data.count, ajaxLimit, updated_at_min );
		}
		else {
			self.postMessage({ 'status': 'complete', 'msg': '0 products need to be updated' });
		}
	}, function(status) {
		self.postMessage({ 'status': 'error', 'msg': 'Error getting update count from the server' });
	});
};

var queueProducts = function(count, limit, updated_at_min) {
	// default values
	count = typeof count !== 'undefined' ? count : 10; // default count is 10
	limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
	updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;		
	
	var requests = [];
	for (var offset = 0; offset < count; offset += limit) {
		requests.push(
			storeProducts(count, limit, offset, updated_at_min )
		);
	}
	console.log(requests.length + ' ajax calls queued');
};


var storeProducts = function(count, limit, offset, updated_at_min) {

	// default values
	limit = typeof limit !== 'undefined' ? limit : 100; // default limit is 100
	offset = typeof offset !== 'undefined' ? offset : 0; // default offset is 0
	updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

	var query = [
		'filter[limit]=' + limit,
		'filter[offset]=' + offset,
		'filter[updated_at_min]=' + updated_at_min,
		'pos=1' 
	];

	// get the products
	getJSON('/wc-api/v1/products?' + query.join('&'), function(data) {

		if( typeof db !== 'object' ) {
			var is_last = false;
			storeCount += data.products.length;
			if( storeCount === count ) {
				is_last = true;
			}
			self.postMessage({ 'status': 'noIndexedDB', 'products': data, 'last': is_last });
			return;
		}

		// prepare for database transaction
		var transaction = db.transaction( ['products'], 'readwrite' );
		var store = transaction.objectStore('products');
		var i = 0;
		putNext();

		function putNext() {
			if( i < data.products.length ) {
				var request = store.put( data.products[i] );
				request.onsuccess = putNext;
				request.onerror = function(e) {
					self.postMessage({ 'status': 'error', 'msg': 'Problem saving ' + e.target.result });
				};
				i++;
			}

			// complete
			else {
				storeCount += i;
				self.postMessage({ 'status': 'success', 'msg': 'Saved ' + storeCount + ' of ' + count + ' products' });
				if( storeCount === count ) {
					self.postMessage({ 'status': 'complete', 'msg': 'Sync complete!' });
				}
			}
		}
	}, function(status) {

		// error getting the products from the server
		self.postMessage({ 'status': 'error', 'msg': 'Error getting products from the server' });
	});

};