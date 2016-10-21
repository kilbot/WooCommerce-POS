/**
 * Card integration
 */

module.exports = {

  /**
   *
   */
  onShow: function(view){
    if(window.Modernizr.touch){
     view.$('#pos-cashback').attr('readonly', true);
    }
  }

};