var bundle = require('cjs-umd');

var options = {
  input: 'index.js',
  output: 'backbone-filtered-collection.js',
  exports: 'FilteredCollection',
  dependencies: [
    { name: 'underscore', exports: '_' },
    { name: 'backbone', exports: 'Backbone' }
  ]
};

bundle(options, function(err) {
  if (err) {
    console.log(err.stack);
  }
});
