'use strict';
var DeepModel = require('../');
var Backbone = require('backbone');
var expect = require('chai').expect;

describe('DeepModel', function() {

	describe('#hasChanged', function() {


		it('hasChanged(): behaves as Model for top level attributes', function() {
			var model = new Backbone.Model({
					test: 1
				}),
				deepModel = new DeepModel({
					test: 1
				});

			expect(deepModel.hasChanged()).to.deep.equal(model.hasChanged());

			//With silent
			model.set({
				test: 2
			});
			deepModel.set({
				test: 2
			});

			expect(model.hasChanged()).to.equal(deepModel.hasChanged());
		});


		it('hasChanged(): with deep attributes', function() {
			var deepModel = new DeepModel({
				foo: {
					bar: 1
				}
			});

			expect(deepModel.hasChanged()).to.be.false;

			deepModel.set({
				'foo.bar': 2
			});
			expect(deepModel.hasChanged()).to.be.true;
		});


		it('hasChanged(attr): behaves as Model for top level attributes', function() {
			var model = new Backbone.Model({
					test: 1
				}),
				deepModel = new DeepModel({
					test: 1
				});

			expect(model.hasChanged('test')).to.equal(deepModel.hasChanged('test'));

			model.set({
				test: 2
			});
			deepModel.set({
				test: 2
			});

			expect(model.hasChanged('test')).to.equal(deepModel.hasChanged('test'));
		});


		it('hasChanged(attr): with deep attributes', function() {
			var deepModel = new DeepModel({
				foo: {
					bar: 1
				}
			});

			expect(deepModel.hasChanged('foo.bar')).to.be.false

			deepModel.set({
				'foo.bar': 2
			});
			expect(deepModel.hasChanged('foo.bar')).to.be.true;
		});


		it('hasChanged(attr): with unchanged deep attributes', function() {
			var deepModel = new DeepModel({
				foo: {
					bar: 1
				}
			});

			expect(deepModel.hasChanged('foo.bar')).to.be.false
			expect(deepModel.hasChanged('foo')).to.be.false

			deepModel.set({
				'foo.bar': 1
			});
			expect(deepModel.hasChanged('foo.bar')).to.be.false;
			expect(deepModel.hasChanged('foo')).to.be.false;
		});
	});



	describe('#hasChanged matching Backbone.Model', function() {

		it('hasChanged(): matches Model behaviour - when not changed', function() {
			var model = new Backbone.Model({
				foo: 'bar'
			});

			var deepModel = new DeepModel({
				foo: 'bar',
				user: {
					first: 'John',
					last: 'Smith'
				}
			});
			expect(model.hasChanged()).to.equal(deepModel.hasChanged());
		});


		it('hasChanged(): matches Model behaviour - when changed', function() {
			var model = new Backbone.Model({
				foo: 'bar'
			});

			var deepModel = new DeepModel({
				foo: 'bar',
				user: {
					first: 'John',
					last: 'Smith'
				}
			});

			model.set('foo', 'baz');
			deepModel.set('foo', 'baz');

			//Should match default Model behavior on top level
			expect(model.hasChanged()).to.equal(deepModel.hasChanged());
		});

		it('hasChanged(attr): matches Model behaviour - when not changed', function() {
			var model = new Backbone.Model({
				foo: 'bar'
			});

			var deepModel = new DeepModel({
				foo: 'bar',
				user: {
					first: 'John',
					last: 'Smith'
				}
			});

			//Should match default Model behavior on top level
			expect(model.hasChanged('foo')).to.equal(deepModel.hasChanged('foo'));

			//On nested
			expect(model.hasChanged('user.first')).to.false;
		});


		it('hasChanged(attr): matches Model behaviour - when changed', function() {
			var model = new Backbone.Model({
				foo: 'bar'
			});

			var deepModel = new DeepModel({
				foo: 'bar',
				user: {
					first: 'John',
					last: 'Smith'
				}
			});

			//Should match default Model behavior on top level
			model.set('foo', 'baz');
			deepModel.set('foo', 'baz');
			expect(model.hasChanged('foo')).to.equal(deepModel.hasChanged('foo'));

			//On nested
			deepModel.set('user.first', 'Frank');

			expect(deepModel.hasChanged('user.first')).to.true;
		});

	});
});
