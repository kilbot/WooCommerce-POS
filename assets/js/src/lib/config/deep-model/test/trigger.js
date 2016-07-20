'use strict';
var DeepModel = require('../');
var expect = require('chai').expect;
var bioData = require('./fixtures/bioData.json');

describe('DeepModel', function() {
	describe('#trigger2 ', function() {
		var triggeredEvents;
		var model = new DeepModel(bioData);
		before(function() {
			triggeredEvents = [];

			model.on('all', function(changedAttr, model, val) {
				triggeredEvents.push(changedAttr);
			});
		});

		it('set: Triggers model change:[attribute] events', function() {
			model.set({
				'id': 456,
				'user.name.first': 'Lana'
			});
			//Check callbacks ran
			expect(triggeredEvents).to.deep.equal([
				'change:id',
				'change:user.name.first',
				'change:user.name.*',
				'change:user.name', // * @restorer
				'change:user.*',
				'change:user', // * @restorer
				'change'
			]);
		});
	});

	describe('#trigger d', function() {

		it("set: Triggers model change:[attribute] events", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:id', function(model, val) {
				expect(val).to.equal(456);
				done();
			});
			model.set({
				id: 456
			});
		});


		it("set: Triggers model change:[attribute] events", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user.name.first', function(model, val) {
				expect(val).to.equal('Lana');
				done();
			});
			model.set({
				'user.name.first': 'Lana',
				'user.name.last': 'Kang'
			});
		});

		it('set: Correct values passed to wildcard event handlers', function(done) {
			var model = new DeepModel(bioData);

			model.on('change:user.name.first', function(model, val) {
				expect(val).to.equal('Lana');
				done();
			});
			model.set({
				'user.name.first': 'Lana'
			});

		});

		it('set: Correct values passed to wildcard event handlers', function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user.name.*', function(model, val) {
				expect(val).to.deep.equal({
					first: 'Lana',
					last: 'Archer'
				});
				done();
			});
			model.set({
				'user.name.first': 'Lana'
			});

		});

		it("set: Correct values passed to wildcard event handlers", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user.*', function(model, val) {
				expect(val).to.deep.equal({
					name: {
						first: 'Lana',
						last: 'Archer'
					},
					type: 'Spy'
				});
				done();
			});
			model.set({
				'user.name.first': 'Lana'
			});

		});

	});

	describe('#trigger', function() {

		it("set: Trigger change events only once", function() {
			var model = new DeepModel(bioData);

			var triggeredEvents = [];

			model.on('all', function(changedAttr, model, val) {
				triggeredEvents.push(changedAttr);
			});

			model.set({
				'id': 456,
				'user.name.first': 'Lana',
				'user.name.last': 'Kang'
			});

			//Check callbacks ran
			expect(triggeredEvents).to.be.deep.equal([
				'change:id',
				'change:user.name.first',
				'change:user.name.*',
				'change:user.name',
				'change:user.*',
				'change:user',
				'change:user.name.last',
				'change'
			]);
		});


		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user', function(model, val) {
				expect(val).to.deep.equal({});
				done()
			});
			model.set('user', {});
		});

		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user', function(model, val) {
				expect(val).to.equal.null;
				done()
			});
			model.set('user', null);
		});

		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel(bioData);
			model.on('change:user', function(model, val) {
				expect(val).to.be.undefined;
				done()
			});
			model.set('user', void 0, true);
		});

		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel({
				id: 123,
				user: {}
			});
			model.on('change:user', function(model, val) {
				expect(val).to.deep.equal(bioData.user);
				done();
			});
			model.set('user', bioData.user);
		});

		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel({
				id: 123,
				user: null
			});
			model.on('change:user', function(model, val) {
				expect(val).to.deep.equal(bioData.user);
				done();
			});
			model.set('user', bioData.user);
		});

		it("should change:[attribute] event for parent keys (like wildcard)", function(done) {
			var model = new DeepModel({
				id: 123
			});
			model.on('change:user', function(model, val) {
				expect(val).to.deep.equal(bioData.user);
				done();
			});
			model.set('user', bioData.user);
		});
	});
});
