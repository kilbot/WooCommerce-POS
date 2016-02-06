var ItemView = require('lib/config/item-view');
var Tmpl = require('./tab.hbs');
var hbs = require('handlebars');
var _ = require('lodash');

module.exports = ItemView.extend({

  tagName: 'li',

  template: hbs.compile(Tmpl),

  events: {
    click: function(e){
      e.preventDefault();
      if( ! this.$el.hasClass(this.activeClassName) ){
        this.trigger('click', this);
      }
    }
  },

  label: {
    observe: 'label'
  },

  initialize: function(options){
    this.mergeOptions(options, ['label', 'activeClassName']);

    // re-render on change to observed attribute
    if( this.label.observe ){
      this.listenTo( this.model, 'change:' + this.label.observe, this.render );
    }
  },

  /**
   * Poor man's stickit
   */
  templateHelpers: function(){
    var label = this.model.get( this.label.observe );

    if( this.label && this.label.onGet ){
      label = this.label.onGet( label, this.model  );
    }

    return {
      label: label || _.result( this, 'label' )
    };
  }

});