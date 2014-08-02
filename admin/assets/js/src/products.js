/**
 * Handles the Product Edit page
 */

(function ( $ ) {
	"use strict";

	$(function () {

	    var Model = Backbone.Model.extend({
	        url: ajaxurl,
	        idAttribute: 'name',
	        save: function(){
				var params = {
					emulateJSON: true, 
					data: { 
						action: 'pos_set_product_visibilty',
						_pos_visibility: this.get('name'),
						post_id: pos_params.post_id,
						security: pos_params.visibility_nonce
					} 
				};
				return Backbone.sync( 'create', this, params );
			}
	    });

	    var Collection = Backbone.Collection.extend({
	    	model: Model,
	    });

	    var View = Backbone.View.extend({
	    	el: $('#pos-visibility'),
	    	template: _.template( $('#tmpl-pos-visibility').html() ),

	    	events: {
	    		'click a' : 'clicked'
	    	},

	    	initialize: function() {
	    		this.collection = new Collection( pos_params.visibility );
	    		this.render();
	    	},

	    	render: function() {
	    		this.$('#pos-visibility-select').html( this.template({ options: this.collection.toJSON() }) );
	    		return this;
	    	},

	    	clicked: function(e) {
	    		e.preventDefault();
	    		var action = e.target.className.match(/\s?action-([a-z]+)/);
	    		if( !action ) { return; }

	    		var self = this;

	    		switch( action[1] ) {
					case 'edit':
						this.$('.action-edit').hide();
						this.$('#pos-visibility-select').slideToggle();
					break;
					case 'save':
						var value = this.$('input:checked').val();
						var model = this.collection.get(value);
						this.$('.spinner').css({ display: 'inline-block', float: 'none' });
						model.save()
						.done( function(msg){
							console.log(this);
							$('#pos-visibility-display').text( model.get('label') );
							self.closeDiv();
						})
						.fail( function(jqXHR, textStatus){
							$('#pos-visibility-select').prepend('<p class="form-invalid" style="padding:5px;margin-top:0;">Error</p>');
							self.$('.spinner').removeAttr('style');
						});
					break;
					case 'cancel':
						this.closeDiv();
					break;
				}
	    	},

	    	closeDiv: function() {
	    		var self = this;
	    		self.$('.spinner').removeAttr('style');
	    		this.$('#pos-visibility-select').slideToggle(400, function() {
					self.$('.action-edit').show();
					self.$('.form-invalid').remove();
				});
	    	}
	    });

	    var App = new View;

	});

}(jQuery));