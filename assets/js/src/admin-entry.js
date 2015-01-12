var _ = require('underscore');

/**
 * create global variable
 */
global['POS'] = {
  Behaviors: {}
};

/**
 * Bootstrap helpers
 */
require('lib/utilities/handlebars-helpers');
require('lib/utilities/stickit-handlers');

/**
 * Expose app and helpers for third party plugins
 */
global['POS'] = _.defaults( require('./admin'), global['POS'] );