'use strict';
var DeepModel = require('../');
var expect = require('chai').expect;
var bioData = require('./fixtures/bioData.json');

describe('DeepModel', function() {
	describe('#unset all', function() {
		var model = new DeepModel(bioData);

		var triggeredEvents = [];
		before(function() {

			model.on('all', function(changedAttr, model, val) {
				triggeredEvents.push(changedAttr);
			});
		});

		it('should trigger events in order', function() {
			model.unset('id');
			model.unset('user.name.first');

			//Check callbacks ran
			expect(triggeredEvents).to.deep.equal([
				'change:id',
				'change',
				'change:user.name.first',
				'change:user.name.*',
				'change:user.name', // * @restorer
				'change:user.*',
				'change:user', // * @restorer
				'change'
			]);
		})
	});
	describe('#unset', function() {

		it('unset: Unset a root key', function() {
			var model = new DeepModel(bioData);
			model.unset('user');
			expect(model.get('user')).to.be.undefined;
			expect(model.toJSON()).to.deep.equal({
				id: 123
			});
		});

		it('unset: Unset a deep key', function() {
			var model = new DeepModel(bioData);
			model.unset('user.type');

			expect(model.get('user')).to.deep.equal({
				name: {
					first: 'Sterling',
					last: 'Archer'
				}
			});

			expect(model.toJSON()).to.deep.equal({
				id: 123,
				user: {
					name: {
						first: 'Sterling',
						last: 'Archer'
					}
				}
			});
		});

		it('unset: Unset a non-existent key', function() {
			var model = new DeepModel(bioData);
			model.unset('foo.bar');

			expect(model.get('user')).to.deep.equal({
				type: 'Spy',
				name: {
					first: 'Sterling',
					last: 'Archer'
				}
			});

			expect(model.toJSON()).to.deep.equal({
				id: 123,
				user: {
					type: 'Spy',
					name: {
						first: 'Sterling',
						last: 'Archer'
					}
				}
			});
		});

		it('unset: Unset a non-existent deep key', function() {
			var model = new DeepModel(bioData);
			model.unset('user.name.middle');

			expect(model.get('user')).to.deep.equal({
				type: 'Spy',
				name: {
					first: 'Sterling',
					last: 'Archer'
				}
			});

			expect(model.toJSON()).to.deep.equal({
				id: 123,
				user: {
					type: 'Spy',
					name: {
						first: 'Sterling',
						last: 'Archer'
					}
				}
			});
		});

		it('unset: Unset a deeper key', function() {
			var model = new DeepModel(bioData);
			model.unset('user.name.last');

			expect(model.get('user')).to.deep.equal({
				type: 'Spy',
				name: {
					first: 'Sterling'
				}
			});

			expect(model.toJSON()).to.deep.equal({
				id: 123,
				user: {
					type: 'Spy',
					name: {
						first: 'Sterling'
					}
				}
			});
		});

		it('unset: Triggers model change:[attribute] events', function(done) {
			var model = new DeepModel(bioData);
			model.on('change:id', function(model, val) {
				expect(val).to.be.undefined;
				done();
			});
			model.unset('id');
		});

		it('unset: Triggers model change:[attribute] events', function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user.name.first', function(model, val) {
				expect(val).to.be.undefined;
				done();
			});
			model.unset('user.name.first');
		});


	})
})
