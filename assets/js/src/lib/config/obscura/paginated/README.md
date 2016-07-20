# backbone-paginated-collection

[![Build Status](https://secure.travis-ci.org/jmorrell/backbone-paginated-collection.png?branch=master)](http://travis-ci.org/jmorrell/backbone-paginated-collection)

Create a read-only paginated version of a backbone collection that stays in sync.

```javascript
var superset = new Backbone.Collection(/* ... */);

// By default there are 20 models per page, but you can configure this
var paginated = new PaginatedCollection(superset, { perPage: 100 });

// Assuming superset.length === 401
assert(paginated.getNumPages() === 4);
assert(paginated.getPage() === 0);
assert(paginated.length === 100);
assert(paginated.hasNextPage());
assert(!paginated.hasPrevPage());

// Go to the next page
paginated.nextPage();
assert(paginated.getPage() === 1);

// Move to the last page
paginated.setPage(3);
assert(paginated.length === 1);
```

## Methods

### new PaginatedCollection

Initialize a new PaginatedCollection by passing in the original collection and optionally
an options hash with the number of models per page. If no `perPage` argument is passed
the collection will always maintain the length of the original collection.

```javascript
var paginated = new PaginatedCollection(originalCollection);

// or

var paginated = new PaginatedCollection(originalCollection, { perPage: 15 });
```

### paginated.setPerPage(perPage)

Change the number of models displayed per page. This will reset the current page to 0.

### paginated.setPage(page)

Change the page. If the page is less than 0, it will be set to 0. If it is longer than
the number of pages, the last page will be selected.

### paginated.getPerPage()

Return the current setting for number of models per page.

### paginated.getNumPages()

Return the current number of pages.

### paginated.getPage()

Return the current page. E.G. if this returns 0, you're on the first page.

### paginated.hasNextPage()

Returns true if this is not the last page.

### paginated.hasPrevPage()

Returns true if this is not the first page.

### paginated.movePage(delta)

Move `delta` pages forwards or backwards (if `delta` is negative).

Ex: `paginated.movePage(-2)` will move two pages back.

### paginated.nextPage()

Move to the next page. Equivalent to `paginated.movePage(1)`.

### paginated.prevPage()

Move to the previous page. Equivalent to `paginated.movePage(-1)`.

### paginated.firstPage()

Move to the first page of the collection. Equivalent to `paginated.setPage(0)`.

### paginated.lastPage()

Move to the last page of the collection. Equivalent to `paginated.setPage(paginated.getNumPages() - 1)`.

### paginated.removePagination()

Get rid of any paginated settings. This means the paginated collection
will always be equal to the superset.

### paginated.superset()

Return a reference to the original collection.

### paginated.destroy()

Remove all ties to the superset and stop updating. Will now be garbage 
collected when it falls out of scope.

## Events

`add`, `remove`, `change`, `reset` should fire as you expect.

`paginated:change:perPage` - Fired whenever the number of models per page is changed. If you
                             remove the pagination settings, `perPage` will be passed as `null`.

`paginated:change:page` - Fired whenever the page is changed.

`paginated:change:numPages` - Fired whenever the number of pages is changed.

`paginated:destroy` - Fired when the proxy is destroyed

## Installation

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone-paginated-collection
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone-paginated-collection
```

and in your code

```javascript
var PaginatedCollection = require('backbone-paginated-collection');
```

### Usage as browser global

You can include `backbone-paginated-collection.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as `PaginatedCollection`
on the global object.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone-paginated-collection.js"></script>
```

## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

Testing relies on the Karma test-runner. If you'd like to use Karma to
automatically watch and re-run the test file during development, it's easiest
to globally install Karma and run it from the CLI.

```
npm install -g karma
karma start
```

To run the tests in Firefox, just once, as CI would:

```
npm test
```

## License

MIT
