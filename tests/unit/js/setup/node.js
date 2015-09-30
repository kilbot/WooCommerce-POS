var jsdom = require("jsdom").jsdom;
global.document = jsdom("hello world");
global.window = global.document.defaultView;
global.$ = global.jQuery = require('jquery');

var proxyquire = require('proxyquire').noCallThru();
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiJquery = require('chai-jquery');
var chaiPromises = require('chai-as-promised');
var chaiBackbone = require('chai-backbone');
var sinonAsPromised = require('sinon-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(chaiJquery);
chai.use(chaiPromises);
chai.use(chaiBackbone);

global.sinon = sinon;
global.expect = chai.expect;
global.proxyquire = proxyquire;

// localStorage
if (typeof global.localStorage === 'undefined' || global.localStorage === null) {
  var LocalStorage    = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./node_modules/node-localstorage/scratch');
  global.localStorage.clear();
}