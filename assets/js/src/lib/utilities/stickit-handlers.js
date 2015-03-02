var bb = require('backbone');

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
 * Display localised string, eg: 2,55
 * Set float 2.55
 */
//bb.Stickit.addHandler({
//  selector: 'input[data-numpad="discount"]',
//  onGet: Utils.formatNumber,
//  onSet: Utils.unformat,
//  events: ['blur'],
//  afterUpdate: function($el){
//    $el.trigger('input');
//  }
//});
//
//bb.Stickit.addHandler({
//  selector: 'input[data-numpad="quantity"]',
//  onGet: Utils.formatNumber,
//  onSet: Utils.unformat,
//  events: ['blur'],
//  afterUpdate: function($el){
//    $el.trigger('input');
//  }
//});