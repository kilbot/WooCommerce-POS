/**
 * add pos token to the server requests
 */
Backbone.sync = _.wrap(Backbone.sync, function(fn, method, model, options) {
    options.headers = _.extend({}, options.headers, {
        'X-WC-POS': 1
    });
    return fn.call(this, method, model, options);
});

/**
 * Set global timeout 50sec
 */
Backbone.$.ajaxSetup({timeout:50000});