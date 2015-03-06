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
 * Multiple selects with Select2
 * ... bit of a hack here due to strange model.set behavior with arrays
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