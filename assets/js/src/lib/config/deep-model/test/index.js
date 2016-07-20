'use strict';
var DeepModel = require('../');
var expect = require('chai').expect;
var bioData = require('./fixtures/bioData.json');

describe('DeepModel', function() {

	describe('basic setting and stuff', function() {
		it('should get: Gets nested attribute values', function() {
			var model = new DeepModel(bioData);
			expect(model.get('id')).to.equal(123)
			expect(model.get('user')).to.deep.equal(bioData.user);
			expect(model.get('user.type')).to.equal('Spy');
			expect(model.get('user.name')).to.deep.equal(bioData.user.name);
			expect(model.get('user.name.first')).to.equal('Sterling');
		});


		it('get: Gets nested attribute values from arrays', function() {
			var model = new DeepModel({
				spies: [{
					name: 'Sterling'
				}, {
					name: 'Lana'
				}]
			});

			expect(model.get('spies.0.name')).to.equal('Sterling');
			expect(model.get('spies.1.name')).to.equal('Lana');
		});


		it('get: Gets attributes if empty objects', function() {
			var model = new DeepModel({
				foo: {},
				bar: []
			});
			expect(model.get('foo')).to.deep.equal({});
			expect(model.get('bar')).to.deep.equal([]);

		});



		it("set: Sets nested values given a path", function() {
			var model = new DeepModel();

			model.set({
				id: 456
			});

			expect(model.attributes.id).equal(456);

			model.set({
				'user.name.first': 'Lana',
				'user.name.last': 'Kang'
			});

			expect(model.attributes.user.name.first).to.equal('Lana');
			expect(model.attributes.user.name.last).to.equal('Kang');


			model.set({
				'user.type': 'Agent'
			});

			expect(model.attributes.user.type).to.equal('Agent');


			model.set({
				'user.name': {
					first: 'Cheryl',
					last: 'Tunt'
				}
			});

			expect(model.attributes.user.name.first).to.equal('Cheryl');
			expect(model.attributes.user.name.last).to.equal('Tunt');

			model.set({
				user: {
					type: 'Secretary',
					name: {
						first: 'Cheryl',
						last: 'Tunt'
					}
				}
			});

			expect(model.attributes.user).to.deep.equal({
				type: 'Secretary',
				name: {
					first: 'Cheryl',
					last: 'Tunt'
				}
			});

		});


		it('set: Sets a single value - not nested', function() {
			var model = new DeepModel();

			model.set('id', 456);

			expect(model.attributes.id).to.equal(456);
		});


		it('set: Sets a single value - nested', function() {
			var model = new DeepModel();

			model.set('user.type', 'Admin');
			model.set('user.name.first', 'Foo');

			expect(model.attributes.user.type).to.equal('Admin');
			expect(model.attributes.user.name.first).to.equal('Foo');
		});

		it('set: Sets a single value inside null to create an object', function() {
			var model = new DeepModel();

			model.set('user', null);
			model.set('user.type', 'Admin');

			expect(model.attributes.user.type).to.equal('Admin');
		});


		it('set: Sets a single value inside null to create an object when given an object', function() {
			var model = new DeepModel();
			model.set('user', null);
			model.set({
				user: {
					type: 'Admin'
				}
			});
			expect(model.attributes.user.type).to.equal('Admin');
		});



		it("set: Sets values when given an object", function() {
			var model = new DeepModel();
			var newValues = {
				id: 456,
				user: {
					type: 'Agent',
					name: {
						first: 'Lana',
						last: 'Kang'
					}
				}
			};
			model.set(newValues);
			expect(model.attributes).to.deep.equal(newValues);
		});

		it('set: Can set an object in place of a child non-object value', function() {
			var model = new DeepModel({
				id: 123,
				name: ''
			});
			var newName = {
				first: 'Burt',
				last: 'Reynolds'
			};
			model.set('name', newName);
			expect(model.attributes.id).to.equal(123);
			expect(model.attributes.name).to.deep.equal(newName);
		});


		it("set: Don't convert Date objects to strings", function() {
			var model = new DeepModel();
			model.set({
				date: new Date
			});
			expect(model.attributes.date).to.be.instanceof(Date);
		});

	});
});
