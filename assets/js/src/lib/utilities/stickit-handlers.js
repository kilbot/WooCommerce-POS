var bb = require('backbone');
var _ = require('lodash');

/**
 * AutoGrow
 */
bb.Stickit.addHandler({
  selector: '.autogrow',
  afterUpdate: function($el){
    $el.trigger('input');
  }
});

/**
 * Select2
 */
bb.Stickit.addHandler({
  selector: 'select.select2',
  initialize: function($el, model, opt){
    $el.trigger('stickit:init', opt.observe); // on-the-fly select options
    var options = _.get( opt, ['view', 'select2', opt.observe ], {} );
    var defaults = {
      width: '250px' // default width
    };
    $el.select2( _.defaults( options, defaults ) );
  },
  getVal: function($el){
    /**
     * below is the default select getVal method
     * it relies on data-stickit-bind-val attr
     */

    //var selected = $el.find('option:selected');
    //
    //if ($el.prop('multiple')) {
    //  return _.map(selected, function(el) {
    //    return Backbone.$(el).data('stickit-bind-val');
    //  });
    //} else {
    //  return selected.data('stickit-bind-val');
    //}

    return $el.val();
  }
});

/**
 * Multiple selects with Select2
 * ... bit of a hack here, setting an array only registers a change
 * ie: if last element removed no change is registered
 */
bb.Stickit.addHandler({
  selector: 'select[multiple].select2',
  onSet: function(val, opts){
    if(_.isArray(val)){
      this.model.unset(opts.observe, {silent:true});
    }
    return val;
  }
});