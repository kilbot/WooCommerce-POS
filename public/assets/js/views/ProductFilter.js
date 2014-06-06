define(['underscore', 'backbone'], 
	function(_, Backbone) {

	/*============================================================================
	 Product Filter
	 borrows heavily from backgrid-filter.js
	 ===========================================================================*/ 

	// view attaches to the search field
	var ProductFilter = Backbone.View.extend({
		el: $('#filter'),
		events: {
			'keydown input[type=search]': 'search',
			'submit'		: 'search',
			'click a.clear'	: 'clear',
		},
		wait: 149,

		initialize: function (options) {
			var collection;
			var self = this;

			// pubsub
			this.pubSub = options.pubSub;

			// focus on the search field when page loads
			this.searchBox().focus();

			// first determine if we're using server or client
			if(this.collection.mode === 'server') {
				this.name = 'filter[q]';

				// Persist the query on pagination
				collection = this.collection;
				if (Backbone.PageableCollection && collection instanceof Backbone.PageableCollection) {
					collection.queryParams[this.name] = function () {
						return self.searchBox().val() || null;
					};
				}
			}

			// client side
			else {
				this.fields = ['title', 'barcode'];

				this._debounceMethods(["search", "clear"]);

				collection = this.collection = this.collection.fullCollection || this.collection;
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
			}
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
			var self = this;
			return function (model) {
				var keys = this.fields || model.keys();
				for (var i = 0, l = keys.length; i < l; i++) {
					if (regexp.test(model.get(keys[i]) + "")) { 

						// if query matches exactly with the barcode
						if( keys[i] === 'barcode' && query === model.get(keys[i]) ) {

							// send product to cart
							self.pubSub.trigger( 'addToCart', model );
						}
						return true; 
					}
				}
				return false;
			};
		},

		searchBox: function () {
			return this.$el.find("input[type=search]");
		},

		search: function(e) {
			if(this.collection.mode === "server") {
				this.serverSearch(e);
			}
			else {
				this.clientSearch(e);
			}
		},

		clientSearch: function(e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.showClearButtonMaybe();
			var matcher = _.bind(this.makeMatcher(this.searchBox().val()), this);
			var col = this.collection;
			if (col.pageableCollection) { col.pageableCollection.getFirstPage({silent: true}); }
			col.reset(this.shadowCollection.filter(matcher), {reindex: false});
		},

		serverSearch: function(e) {
			this.showClearButtonMaybe();

			// only search on enter
			if (e.keyCode === 13) {
				var data = {};
				var query = this.searchBox().val();
				if (query) { data[this.name] = query; }

				var collection = this.collection;

				// go back to the first page on search
				if (Backbone.PageableCollection &&
					collection instanceof Backbone.PageableCollection) {
					collection.getFirstPage({data: data, reset: true, fetch: true});
				}
				else { 
					collection.fetch({data: data, reset: true});
				}
			}
		},

		clearButton: function () {
			return this.$el.find("a.clear");
		},

		clear: function (e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.clearSearchBox();

			if(this.collection.mode === 'server') {
				// go back to the first page on clear
				if (Backbone.PageableCollection && this.collection instanceof Backbone.PageableCollection) {
					this.collection.getFirstPage({reset: true, fetch: true});
				}
				else {
					this.collection.fetch({reset: true});
				}
			}
			else {
				if (this.collection.pageableCollection) { this.collection.pageableCollection.getFirstPage({silent: true}); }
				this.collection.reset(this.shadowCollection.models, {reindex: false});
			}
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