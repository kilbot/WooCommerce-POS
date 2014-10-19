/**
 * Web Worker.
 * Performs server sync in the background.
 */

var db,
	progress = 0,
	wc_api_url = '/wc-api/v1/';

// number of products to get in a single ajax call
// adjust to prevent server timeouts
var ajaxLimit = 50;

/**
 * Messaging from main thread 
 */
addEventListener('message', function(e) {
	var data = e.data;

	switch (data.cmd) {
		case 'update':
			if( typeof data.wc_api_url !== 'undefined' && data.wc_api_url !== '' ) {
				wc_api_url = data.wc_api_url;
			}
			getUpdateCount(data.last_update);
		break;
		case 'stop':
			postMessage({ 'status': 'notice', 'msg': 'Worker stopped' });
			close(); // Terminates the worker.
		break;
		default:
			postMessage({ 'status': 'complete', 'msg': 'Unknown command: ' + data.cmd });
	}

}, false);

/**
 * getJSON helper function
 */
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

/**
 * Get updated product count
 */
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
			postMessage({ 'status': 'notice', 'msg': data.count + ' products need to be updated' });
			if( data.count > ajaxLimit ) {
				postMessage({ 'status': 'modal', 'total': data.count });
			}
			getProducts( data.count, ajaxLimit, updated_at_min );
		}
		else {
			postMessage({ 'status': 'products', 'products': [], 'progress': 0, 'total': 0 });
		}
	}, function(status) {
		postMessage({ 'status': 'error', 'msg': wc_api_url + 'products/count returned an error' });
	});
};

/**
 * Get products
 */
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

				// send products back to main thread
				progress += data.products.length;
				postMessage({ 'status': 'products', 'products': data.products, 'progress': progress, 'total': count });

				// get the next limit of products
				next = offset + limit;
				if( next < count ) {
					getNext( next );
				}

			}, function(status) {

				// handle the errors
				if ( 503 === status ) { // server timeout

					// recurse on 503 up to 10 times
					if( ++failed < 10 ) {
						// give the server some breathing room
						interval = interval + 1000;
						getNext( offset, interval );
						postMessage({ 'status': 'error', 'msg': 'Failed to retrieve products, trying again ...' });
					}

					// server could be down or overloaded
					else {
						postMessage({ 'status': 'error', 'msg': 'Server down or overloaded' });
						postMessage({ 'status': 'products', 'progress': progress, 'total': progress });
					}
				}
				else if ( 401 === status ) { // 
					postMessage({ 'status': 'error', 'msg': 'Authentication error when retrieving products' });
					postMessage({ 'status': 'products', 'progress': progress, 'total': progress });
				}
				else {
					postMessage({ 'status': 'error', 'msg': 'Server error when retrieving products' });
					postMessage({ 'status': 'products', 'progress': progress, 'total': progress });
				}

			});
		}, interval);
	})( offset, interval );
};