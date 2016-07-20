'use strict';
var DeepModel = require('../');
var Backbone = require('backbone');
var expect = require('chai').expect;
var bioData = require('./fixtures/bioData.json');

describe('DeepModel', function() {
	describe('#has', function() {

		it('changedAttributes(): returns changed attributes', function() {
			var model = new DeepModel(bioData);

			model.set('user.name.first', 'Lana', {
				silent: true
			});

			var changed = model.changedAttributes();

			var expected = {
				'user.name.first': 'Lana'
			};

			expect(changed).to.deep.equal(expected);
		});


		it('changedAttributes(): returns changed attributes compared to given object', function() {

			var model = new DeepModel(bioData);
			var diff = {
				id: 789,
				'user.name.last': 'Kang'
			};

			var changed = model.changedAttributes(diff);

			var expected = {
				id: 789,
				'user.name.last': 'Kang'
			};

			expect(changed).to.deep.equal(expected);
		});


		it('changedAttributes(): behaves as Model for top level properties', function() {
			var model = new Backbone.Model({
				foo: 1,
				bar: 1
			});
			var deepModel = new DeepModel({
				foo: 1,
				bar: 1
			});

			expect(deepModel.changedAttributes()).to.deep.equal(model.changedAttributes());

			model.set({
				foo: 2
			});
			deepModel.set({
				foo: 2
			});

			expect(model.changedAttributes()).to.deep.equal({
				foo: 2
			});
			expect(deepModel.changedAttributes()).to.deep.equal({
				foo: 2
			});
		});

		it('changedAttributes(): with deep properties', function() {
			var deepModel = new DeepModel({
				foo: {
					baz: 1
				},
				bar: {
					baz: 1
				}
			});
			expect(deepModel.changedAttributes()).to.equal(false);
			deepModel.set({
				'foo.bar': 2
			});
			expect(deepModel.changedAttributes()).to.deep.equal({
				'foo.bar': 2
			});
		});

		it('changedAttributes(diff): behaves as Model for top level properties', function() {
			var model = new Backbone.Model({
					foo: 1,
					bar: 1
				}),
				deepModel = new DeepModel({
					foo: 1,
					bar: 1
				});

			var diff = {
				foo: 2
			};

			expect(deepModel.changedAttributes(diff)).to.deep.equal(model.changedAttributes(diff));
			expect(deepModel.changedAttributes(diff)).to.deep.equal({ foo: 2 });

			model.set({
				foo: 2
			});
			deepModel.set({
				foo: 2
			});

			expect(deepModel.changedAttributes(diff)).to.deep.equal(model.changedAttributes(diff));
			expect(deepModel.changedAttributes(diff)).to.be.false;
		});

		it('changedAttributes(diff): with deep properties', function() {
			var deepModel = new DeepModel({
				foo: {
					baz: 1
				},
				bar: {
					baz: 1
				}
			});

			var diff = {
				'foo.baz': 2
			};

			expect(deepModel.changedAttributes(diff)).to.deep.equal({
				'foo.baz': 2
			});

			deepModel.set({
				'foo.baz': 2
			});
			expect(deepModel.changedAttributes(diff)).to.equal(false);
		});
	});
});
