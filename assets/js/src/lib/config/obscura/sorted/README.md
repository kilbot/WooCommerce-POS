# backbone-sorted-collection

[![Build Status](https://secure.travis-ci.org/jmorrell/backbone-sorted-collection.png?branch=master)](http://travis-ci.org/jmorrell/backbone-sorted-collection)

Create a read-only sorted version of a backbone collection that stays in sync.

```javascript
var sorted = new SortedCollection(originalCollection);

sorted.setSort(function(model) {
  return model.get('foo');
});

// or

sorted.setSort('foo');

// or

sorted.setSort(function(model) {
  return calculateSomething(model);
});

sorted.reverseSort();

// also chainable
sorted
  .setSort('name')
  .reverseSort();

// or pass in the initial sort direction
sorted.setSort('name', 'desc');
```

## Methods

### new SortedCollection

### sorted.setSort(comparator, direction)

`comparator` accepts:
- nothing or `null`, resets the sorting to the same order as the superset
- a string, sorts by a model key
- a function that accepts a model and returns a value

`direction` must be one of: `"asc"` or `"desc"`. If it's not provided it
will default to `"asc"`.

```javascript
// sort by the 'age' property descending
sorted.setSort('age', 'desc');

// equivalent to this
sorted.setSort(function(model) {
  return model.get('age');
}, 'desc');

// but we can also do arbitrary computation in the closure
sorted.setSort(function(mode) {
  return someComplicatedCalculation(model);
});

// Characters with accents get sorted to the end of the alphabet, 
// so let's sort based on the unaccented version.
sorted.setSort(function(model) {
  return removeAccents(model.get('name'));
});

// Pass nothing as an option to remove all sorting
sorted.setSort();
```
### sorted.removeSort

Remove all sorting. Equivalent to calling `sorted.setSort()`

```javascript
sorted.removeSort();
```

### sorted.reverseSort

Reverse the sort. The API is chainable, so this can be called directly
after `setSort` if you want the sort to be descending.

If there is no current sort function then this does nothing.

```javascript
// Sort by age descending
sorted.setSort('age').reverseSort();
```

### sorted.destroy()

Remove all ties to the superset and stop updating. Will now be garbage 
collected when it falls out of scope.

## Events

`add`, `remove`, `change`, `reset` should fire as you expect.

`sorted:add` - Fired when a sort function is set

`sorted:remove` - Fired when a sort function is removed

`sorted:destroy' - Fired when the proxy is destroyed

## Installation

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone-sorted-collection
```

and in your code

```javascript
var SortedCollection = require('backbone-sorted-collection');
```

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone-sorted-collection
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage as browser global

You can include `backbone-sorted-collection.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as `SortedCollection`
on the global object.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone-sorted-collection.js"></script>
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

