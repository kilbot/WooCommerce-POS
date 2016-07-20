global._ = require('underscore');
global.Backbone = require('backbone');
global.chai = require('chai');
global.sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

global.PaginatedCollection = require('../index');