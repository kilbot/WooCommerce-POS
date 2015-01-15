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
            expect(console.log).to.have.been.calledOnce;
            expect(console.log).to.have.been.calledWith('foo');
        });

        it('should switch console methods', function () {
            this.debugLog('foo', 'error');
            expect(console.log).not.to.have.been.called;
            expect(console.error).to.have.been.calledOnce;
            expect(console.error).to.have.been.calledWith('foo');
        });

        it('should default to log', function () {
            this.debugLog('foo', 'bar');
            expect(console.log).to.have.been.calledOnce;
            expect(console.log).to.have.been.calledWith('foo');
        });

    });

});