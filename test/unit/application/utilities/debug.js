describe('lib/utilities/debug.js', function () {

    beforeEach(function () {
        stub(console, 'log');
        stub(console, 'error');
        stub(console, 'info');

        // set flag on
        stub(localStorage, 'getItem').returns(1);

        // Debug().log
        this.debugLog = require('lib/utilities/debug');
    });

    describe('debugLog', function () {
        it('should log a message', function () {
            this.debugLog('foo');
            sinon.assert.calledOnce(console.log);
            sinon.assert.calledWithExactly(console.log, 'foo');
        });
        it('should switch console methods', function () {
            this.debugLog('foo', 'error');
            sinon.assert.notCalled(console.log);
            sinon.assert.calledOnce(console.error);
            sinon.assert.calledWithExactly(console.error, 'foo');
        });
        it('should default to log', function () {
            this.debugLog('foo', 'bar');
            sinon.assert.calledOnce(console.log);
            sinon.assert.calledWithExactly(console.log, 'foo');
        });
    });

});