var $ = require('jquery');

module.exports = function(view){

  view.print = function(){
    return $.ajax({
      type       : 'post',
      url        : this.getReceiptOptions(),
      // contentType: 'text/xml',
      data       : this.getData(),
      // dataType   : 'xml',
      processData: false,
      beforeSend : function (xhr) {
        xhr.setRequestHeader('SOAPAction', '""');
      }
    });
  };

  return view;
};