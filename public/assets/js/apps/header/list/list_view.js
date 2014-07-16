define(['app', 'handlebars'],
function(POS, Handlebars){

	POS.module('HeaderApp.List.View', function(View, POS, Backbone, Marionette, $, _){
	
		View.Header = Marionette.ItemView.extend({
			template: Handlebars.compile( '<a href="#{{ url }}">{{ name }}</a>' ),
			tagName: 'li',

			events: {
				'click a': 'navigate'
			},

			navigate: function(e){
				e.preventDefault();
				this.trigger('navigate', this.model);
			},

			onRender: function(){
				if(this.model.selected){
					// add class so Bootstrap will highlight the active entry in the navbar
					this.$el.addClass('active');
				}
			}
		});

		View.Headers = Marionette.CompositeView.extend({
			template: '<div><ul class="nav"></ul></div>',
			childView: View.Header,
			childViewContainer: 'ul',

			events: {
				'click a.brand': 'brandClicked'
			},

			brandClicked: function(e){
				e.preventDefault();
				this.trigger('brand:clicked');
			}
		});

	});

	return POS.HeaderApp.List.View;
});