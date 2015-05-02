var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var Select2 = require('lib/behaviors/select2');
var Tooltip = require('lib/behaviors/tooltip');
var CustomerSelect = require('lib/components/customer-select/view');

var View = FormView.extend({

  template: function(){
    return $('script[data-id="general"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-general'
  },

  behaviors: {
    Select2: {
      behaviorClass: Select2,
      maximumSelectionSize: 4
    },
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  onRender: function(){
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });

    this.customerSelect();
  },

  customerSelect: function(){
    var view = new CustomerSelect({
      el    : this.$('*[data-component="customer-select"]'),
      model : this.model
    });
    view.render();

    // update model on customer select
    this.listenTo(view, 'customer:select', function(customer) {
      this.model.set({
        default_customer: customer.id,
        customer: customer
      });
    });

    // disable customer select if logged_in_user checked
    if(this.model.get('logged_in_user')){
      view.triggerMethod('select:disable', true);
    }

    this.model.on('change:logged_in_user', function(model, toggle){
      view.triggerMethod('select:disable', toggle);
    });

    // clean up
    // TODO: abstract clean up
    this.on('destroy', function(){
      view.destroy();
    });
  }

});

module.exports = View;
POS.attach('SettingsApp.General.View');