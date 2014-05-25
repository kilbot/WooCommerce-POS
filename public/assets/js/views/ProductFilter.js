define(['jquery', 'underscore', 'backbone', 'collections/Products'], function($, _, Backbone, Products) {

	/*============================================================================
	 Product Filter
	 borrows heavily from backgrid-filter.js
	 ===========================================================================*/ 

	// view attaches to the search field
	var ProductFilter = Backbone.View.extend({
		el: $('#filter'),
		collection: Products,
		fields: ['title'],
		events: {
			'keydown input[type=search]': 'search',
			'submit'		: 'search',
			'click a.clear'	: 'clear',
		},
		wait: 149,

		initialize: function (options) {

			this._debounceMethods(["search", "clear"]);

			var collection = this.collection = this.collection.fullCollection || this.collection;
			var shadowCollection = this.shadowCollection = collection.clone();

			this.listenTo(collection, "add", function (model, collection, options) {
				shadowCollection.add(model, options);
			});
			this.listenTo(collection, "remove", function (model, collection, options) {
				shadowCollection.remove(model, options);
			});
			this.listenTo(collection, "sort", function (col) {
				if (!this.searchBox().val()) { shadowCollection.reset(col.models); }
			});
			this.listenTo(collection, "reset", function (col, options) {
				options = _.extend({reindex: true}, options || {});
				if (options.reindex && options.from == null && options.to == null) {
					shadowCollection.reset(col.models);
				}
			});
		},

		_debounceMethods: function (methodNames) {
			if (_.isString(methodNames)) { methodNames = [methodNames]; }

			this.undelegateEvents();

			for (var i = 0, l = methodNames.length; i < l; i++) {
				var methodName = methodNames[i];
				var method = this[methodName];
				this[methodName] = _.debounce(method, this.wait);
			}

			this.delegateEvents();
		},

		makeRegExp: function (query) {
      		return new RegExp(query.trim().split(/\s+/).join("|"), "i");
    	},

    	makeMatcher: function (query) {
			var regexp = this.makeRegExp(query);
			return function (model) {
				var keys = this.fields || model.keys();
				for (var i = 0, l = keys.length; i < l; i++) {
					if (regexp.test(model.get(keys[i]) + "")) { return true; }
				}
				return false;
			};
		},

		searchBox: function () {
			return this.$el.find("input[type=search]");
		},

		search: function (e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.showClearButtonMaybe();
			var matcher = _.bind(this.makeMatcher(this.searchBox().val()), this);
			var col = this.collection;
			if (col.pageableCollection) { col.pageableCollection.getFirstPage({silent: true}); }
			col.reset(this.shadowCollection.filter(matcher), {reindex: false});
		},

		clearButton: function () {
			return this.$el.find("a.clear");
		},

		clear: function (e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.clearSearchBox();
			var col = this.collection;
			if (col.pageableCollection) { col.pageableCollection.getFirstPage({silent: true}); }
			col.reset(this.shadowCollection.models, {reindex: false});
		},

		clearSearchBox: function() {
			this.value = null;
			this.searchBox().val(null);
			this.showClearButtonMaybe();
		},

		showClearButtonMaybe: function () {
			var $clearButton = this.clearButton();
			var searchTerms = this.searchBox().val();
			if (searchTerms) { $clearButton.show(); }
			else { $clearButton.hide(); }
		},

	});

	return ProductFilter;
});