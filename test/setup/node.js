if (!global.document || !global.window) {
    var jsdom = require('jsdom').jsdom;

    global.document = jsdom('<html><head><script></script></head><body></body></html>', null, {
        FetchExternalResources   : ['script'],
        ProcessExternalResources : ['script'],
        MutationEvents           : '2.0',
        QuerySelector            : false
    });

    global.window = document.createWindow();
    global.navigator = global.window.navigator;
    global.location = global.window.location;
}

// localStorage
if (typeof global.localStorage === 'undefined' || global.localStorage === null) {
    var LocalStorage    = require('node-localstorage').LocalStorage;
    global.localStorage = new LocalStorage('./scratch');
}

global.$ = global.jQuery = require('jquery');

var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiJquery = require('chai-jquery');

chai.use(sinonChai);
chai.use(chaiJquery);

global.sinon = sinon;
global.expect = chai.expect;
global.proxyquire = proxyquire;