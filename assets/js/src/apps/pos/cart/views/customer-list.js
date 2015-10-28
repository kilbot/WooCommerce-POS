var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./customer-list.hbs');
var hbs = require('handlebars');

var Customer = ItemView.extend({
  template: hbs.compile(Tmpl),
  tagName: 'li',
  triggers: {
    'click': 'customer:selected'
  },
  events: {
    mouseenter: 'onHover'
  },
  onHover: function(){
    if(!this.hasFocus()){
      this.trigger('focus');
      this.addFocus();
    }
  },
  addFocus: function(){
    this.$el.addClass('focus');
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

  initialize: function(){
    var filtered = this.collection;
    var customers = this.collection.superset();

    if( customers.isNew() ){
      return customers.fetch()
        .then(function(){
          customers.fullSync();
        });
    } else {
      filtered
        .removeTransforms()
        .setPerPage(10);
    }

    this.listenTo(filtered, 'sorted', function(){
      console.log(arguments);
    });
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
    var child = this.getFocusedChild();
    if(!child){
      return this.children.first().addFocus();
    }

    var nextChild = this.children.findByIndex( ++child._index );
    if(nextChild){
      child.removeFocus();
      nextChild.addFocus();
    }
  },

  moveFocusUp: function(){
    var child = this.getFocusedChild();
    if(!child){
      return this.children.last().addFocus();
    }

    var nextChild = this.children.findByIndex( --child._index );
    if(nextChild){
      child.removeFocus();
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