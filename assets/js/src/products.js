/**
 * Handles the Product Edit page
 * todo: refactor
 */
/* jshint -W071 */
(function () {

  'use strict';

  var $         = window.jQuery;
  var _         = window._;
  var Backbone  = window.Backbone;
  var ajaxurl   = window.ajaxurl;
  var posParams = window.posParams;

  var Model = Backbone.Model.extend({
      url: ajaxurl,
      idAttribute: 'name',
      save: function(){
    var params = {
      emulateJSON: true,
      data: {
        action: 'pos_set_product_visibilty',
        posVisibility: this.get('name'),
        postId: posParams.postId,
        security: posParams.visibilityNonce
      }
    };
    return Backbone.sync( 'create', this, params );
  }
  });

  var Collection = Backbone.Collection.extend({
    model: Model
  });

  var View = Backbone.View.extend({
    el: $('#pos-visibility'),
    template: _.template( $('#tmpl-pos-visibility').html() ),

    events: {
      'click a' : 'clicked'
    },

    initialize: function() {
      this.collection = new Collection( posParams.visibility );
      this.render();
    },

    render: function() {
      this.$('#pos-visibility-select')
        .html( this.template({ options: this.collection.toJSON() }) );
      return this;
    },

    clicked: function(e) {
      e.preventDefault();
      var action = e.target.className.match(/\s?action-([a-z]+)/);
      this.doAction(action[1]);
    },

    doAction: function(action){
      var actions = {
        edit: this.edit,
        save: this.save,
        cancel: this.cancel
      };
      if (typeof actions[action] !== 'function') {
        throw new Error('Invalid action.');
      }
      return actions[action]();
    },

    edit: function(){
      this.$('.action-edit').hide();
      this.$('#pos-visibility-select').slideToggle();
    },

    save: function(){
      var self = this;
      var value = this.$('input:checked').val();
      var model = this.collection.get(value);
      this.$('.spinner').css({'display': 'inline-block', 'float': 'none'});
      model.save({
        success: function(){
          $('#pos-visibility-display').text(model.get('label'));
          self.cancel();
        },
        error: function(){
          $('#pos-visibility-select')
              .prepend('<p class="form-invalid">Error</p>')
              .css({'padding': '5px', 'margin-top': 0});
          self.$('.spinner').removeAttr('style');
        }
      });
    },

    cancel: function() {
      var self = this;
      this.$('.spinner').removeAttr('style');
      this.$('#pos-visibility-select').slideToggle(400, function() {
        self.$('.action-edit').show();
        self.$('.form-invalid').remove();
      });
    }
  });

  $( document ).ready(function() {
    return new View();
  });

})();
/* jshint +W071 */