var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./customer-list.hbs');
var hbs = require('handlebars');
var _ = require('lodash');

var Customer = ItemView.extend({
  template: hbs.compile(Tmpl),
  tagName: 'li',
  triggers: {
    'click': 'customer:selected'
  },
  addFocus: function(){
    this.$el.addClass('focus').scrollIntoView();
  },
  removeFocus: function(){
    this.$el.removeClass('focus');
  },
  hasFocus: function(){
    return this.$el.hasClass('focus');
  }
});

var NoCustomer = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: function(){
    return polyglot.t('messages.no-customer');
  }
});

var Customers = InfiniteListView.extend({
  childView: Customer,
  emptyView: NoCustomer,
  childViewContainer: 'ul',
  className: 'list-infinite dropdown-list',

  initialize: function(options){
    options = options || {};
    this.collection.fetch();

    // if( customers.isNew() ){
    //   return customers.fetch()
    //     .then(function(){
    //       customers.fullSync();
    //     });
    // } else {
    //   filtered.query(options.filter);
    // }
  },

  childEvents: {
    focus: 'onChildFocus'
  },

  onChildFocus: function(){
    this.children.each(function(view){
      view.removeFocus();
    });
  },

  moveFocus: function(keyCode) {
    if(keyCode === 40){
      this.moveFocusDown();
    }
    if(keyCode === 38){
      this.moveFocusUp();
    }
    if(keyCode === 13){
      this.getFocusedChild().trigger('customer:selected');
    }
  },

  moveFocusDown: function(){
    var next, nextChild, focused = this.getFocusedChild();
    if(!focused){
      return this.children.first().addFocus();
    }

    _.each(this.children._views, function(child){
      if(next){
        nextChild = child;
        next = false;
      }
      next = child === focused;
    });

    if(nextChild){
      focused.removeFocus();
      nextChild.addFocus();
    }
  },

  moveFocusUp: function(){
    var next, nextChild, focused = this.getFocusedChild();
    if(!focused){
      return this.children.last().addFocus();
    }

    _.eachRight(this.children._views, function(child){
      if(next){
        nextChild = child;
        next = false;
      }
      next = child === focused;
    });

    if(nextChild){
      focused.removeFocus();
      nextChild.addFocus();
    }
  },

  getFocusedChild: function(){
    return this.children.find(function(view){
      return view.hasFocus();
    });
  }

});


module.exports = Customers;