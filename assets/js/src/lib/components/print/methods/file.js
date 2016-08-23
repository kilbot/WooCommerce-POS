var $ = require('jquery');
var textFile = null;

/**
 * Make text file
 */
var makeTextFile = function(data){
  var text = new Blob([data], {type: 'text/plain'});

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(text);

  // returns a URL you can use as a href
  return textFile;
};

module.exports = function(view){

  view.print = function(){
    var link = $('<a>')
      .attr({
        download: this.model.get('order_number') + '.txt',
        href    : makeTextFile( view.getData() )
      })
      .css({
        visibility: 'hidden',
        position  : 'absolute',
        right     : '100%',
        bottom    : '100%'
      })
      .appendTo('body');

    return new Promise(function(resolve){
      // wait for the link to be added to the document
      window.requestAnimationFrame(function () {
        // click the link
        link.get(0).click();
        link.remove();
        resolve();
      });
    });
  };

  return view;
};