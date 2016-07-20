# backbone-filtered-collection

[![Build Status](https://secure.travis-ci.org/jmorrell/backbone-filtered-collection.png?branch=master)](http://travis-ci.org/user/backbone-filtered-collection)

Create a read-only filtered version of a backbone collection that stays in sync.

```javascript
var superset = new Backbone.Collection(/* ... */);
var filtered = new FilteredCollection(superset);

// Filtered will contain only models where model.get('foo') === "bar"
filtered.filterBy({ foo: "bar" });

// A new model to the superset will automatically show up in the filtered
// collection, firing an "add" event
superset.add({ foo: "bar", baz: "qux" });

// Also supports named multiple named filters and arbitrary functions
filtered.filterBy('age-range', function(model) {
  return model.get('age') > 17 && model.get('age') < 70;
});

// Remove a filter and the filtered collection will update
filtered.removeFilter('age-range');
```

## Installation

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone-filtered-collection
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone-filtered-collection
```

and in your code

```javascript
var FilteredCollection = require('backbone-filtered-collection');
```

### Usage as browser global

You can include `backbone-filtered-collection.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as `FilteredCollection`
on the global object.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone-filtered-collection.js"></script>
```

## Methods

#### new FilteredCollection

Initialize a new FilteredCollection by passing in the original collection.

```javascript
var filtered = new FilteredCollection(originalCollection);
```

#### filtered.filterBy([filterName], filter)

Apply a new filter to the set. Takes an optional filter name.

Can be a simple object that defines required key / value pairs.
```javascript
filtered.filterBy('foo and bar filter', { foo: 2, bar: 3 });
```

Or the you can pass a filter function instead of a value.
```javascript
filtered.filterBy('a > 2', { a: function(val) { 
  return val > 2;
}});
```

Or you can use an arbitrary filter function on the model itself.

```javascript
filtered.filterBy('age', function(model) {
  return model.get('age') > 10 && model.get('age') < 40;
});
```

#### filtered.removeFilter(filterName)

Remove a previously applied filter. Accepts a filter name.

```javascript
filtered.removeFilter('age');
```

#### filtered.resetFilters()

Removes all applied filters. After the collection should be the same as the superset.

```javascript
filtered.resetFilters();
```

#### filtered.getFilters()

Returns a list of the names of applied filters.

*Note:* If added a filter with no name, it will show up here as `__default`.

```javascript
filtered.getFilters();
```

#### filtered.hasFilter()

Given a string, return whether or not that filter is currently applied.

```javascript
filtered.hasFilter('name');
```

#### filtered.superset()

Return a reference to the original collection.

```javascript
filtered.superset();
```

#### filtered.refilter()

If the collections get out of sync (ex: change events have been suppressed) force
the collection to refilter all of the models.

```javascript
filtered.refilter();
```

Can also be forced to run on one model in particular.

```javascript
filtered.refilter(model);
```

### filtered.destroy()

Remove all ties to the superset and stop updating. Will now be garbage 
collected when it falls out of scope.

## Events

`add`, `remove`, `change`, `reset` should fire as you expect.

`filtered:add` - Fired when a new filter is added. Passes the filter name.

`filtered:remove` - Fired with a filter is removed. Passes the filter name.

`filtered:reset` - Fired when all of the filters are removed.

`filtered:destroy' - Fired when the proxy is destroyed

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

