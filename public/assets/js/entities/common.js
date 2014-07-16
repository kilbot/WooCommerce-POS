define(['app'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){
	
		Entities.FilteredCollection = function(options){
			var original = options.collection;
			var filtered = new original.constructor();
			filtered.add(original.models);
			filtered.filterFunction = options.filterFunction;

			var applyFilter = function(filterCriterion, filterStrategy, collection){
				var collection = collection || original;
				var criterion;
				if(filterStrategy == 'filter'){
					criterion = filterCriterion.trim();
				}
				else{
					criterion = filterCriterion;
				}

				var items = [];
				if(criterion){
					if(filterStrategy == 'filter'){
						if( ! filtered.filterFunction){
							throw('Attempted to use \'filter\' function, but none was defined');
						}
						var filterFunction = filtered.filterFunction(criterion);
						items = collection.filter(filterFunction);
					}
					else{
						items = collection.where(criterion);
					}
				}
				else{
					items = collection.models;
				}

				// store current criterion
				filtered._currentCriterion = criterion;

				return items;
			};

			filtered.filter = function(filterCriterion){
				filtered._currentFilter = 'filter';
				var items = applyFilter(filterCriterion, 'filter');

				// reset the filtered collection with the new items
				filtered.reset(items);
				return filtered;
			};

			filtered.where = function(filterCriterion){
				filtered._currentFilter = 'where';
				var items = applyFilter(filterCriterion, 'where');

				// reset the filtered collection with the new items
				filtered.reset(items);
				return filtered;
			};

			// when the original collection is reset,
			// the filtered collection will re-filter itself
			// and end up with the new filtered result set
			original.on('reset', function(){
				var items = applyFilter(filtered._currentCriterion, filtered._currentFilter);

				// reset the filtered collection with the new items
				filtered.reset(items);
			});

			// if the original collection gets models added to it:
			// 1. create a new collection
			// 2. filter it
			// 3. add the filtered models (i.e. the models that were added *and*
			//		 match the filtering criterion) to the `filtered` collection
			original.on('add', function(models){
				var coll = new original.constructor();
				coll.add(models);
				var items = applyFilter(filtered._currentCriterion, filtered._currentFilter, coll);
				filtered.add(items);
			});

			return filtered;
		};

	});

	return POS.Entities.FilteredCollection;
});