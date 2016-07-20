'use strict';
var DeepModel = require('../');
var Backbone = require('backbone');
var expect = require('chai').expect;

describe('DeepModel', function() {
	describe('#defaults', function() {
		it('defaults: with deep attributes', function() {
			var DefaultsModel = DeepModel.extend({
				defaults: {
					details: {
						name: {
							last: 'Smith',
							initial: 'J'
						}
					}
				}
			});

			var model1 = new DefaultsModel({
				details: {
					name: {
						first: 'John',
						initial: 'Z'
					}
				}
			});

			var model2 = new DefaultsModel({
			});

			expect(model1.get('details.name.first')).to.equal('John');
			expect(model1.get('details.name.last')).to.equal('Smith');
			expect(model1.get('details.name.initial')).to.equal('Z');
			expect(model2.get('details.name.first')).to.be.empty;
			expect(model2.get('details.name.last')).to.equal('Smith');
			expect(model2.get('details.name.initial')).to.equal('J');
		});


		it('defaults: does not cause a problem with a collection in an attribute', function() {
			var Model = DeepModel.extend({
				defaults: {
					foo: 'bar'
				}
			});

			var model = new Model({
				collection: new Backbone.Collection()
			});

			expect(model.get('collection')).is.instanceof(Backbone.Collection);
		});

	});
});
