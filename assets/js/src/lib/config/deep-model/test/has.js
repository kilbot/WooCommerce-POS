var DeepModel = require('../');
var expect = require('chai').expect;
var bioData = require('./fixtures/bioData.json');

describe('DeepModel', function() {
	describe('#has', function() {
		it('should has: Check if model has deep key', function() {
			var model = new DeepModel(bioData);
			expect(model.has('user.name.last')).to.be.true;
		})

		it("has: Don't find nonexistent key", function() {
			var model = new DeepModel(bioData);
			expect(model.has('user.turtleneck')).to.be.false;
		});
	});
});
