describe('lib/components/keypress/service.js', function () {

  // Utility to build a keypress event for a character
  function keypressFor(key) {
    return $.Event('keypress', { which: key.charCodeAt(0) });
  }

  beforeEach(function () {
    var KeypressService = require('lib/components/keypress/service');
    this.keypressService = new KeypressService();
  });

  it('should be in a valid state', function() {
    expect(this.keypressService).to.be.ok;
  });

  // it('should store keypresses in buffer', function() {
  //   $('body').trigger(keypressFor('t'));
  //   expect(this.keypressService.getBuffer()).eqls(['t']);
  // });
  //
  // it('should clear buffer after default delay (240ms)', function(done) {
  //   $('body').trigger(keypressFor('t'));
  //   expect(this.keypressService.getBuffer()).eqls(['t']);
  //   var self = this;
  //
  //   setTimeout(function(){
  //     expect(self.keypressService.getBuffer()).eqls([]);
  //     done();
  //   }, 240);
  // });
  //
  // it('should trigger event if scan detected', function(done) {
  //   ['q', 'w', 'e', 'r', 't', 'y'].forEach(function(key){
  //     $('body').trigger(keypressFor(key));
  //   });
  //
  //   this.keypressService.channel.once('scan', function(keys){
  //     expect(keys).eqls(['q', 'w', 'e', 'r', 't', 'y']);
  //     done();
  //   });
  // });
  //
  // it('should not trigger event if average keypress exceeds default (40ms)', function(done) {
  //   var self = this;
  //   var delay = (6 * 40) / 5;
  //
  //   function sleep () {
  //     return new Promise(function(resolve){ setTimeout(resolve, delay); });
  //   }
  //
  //   $('body').trigger(keypressFor('q'));
  //
  //   sleep()
  //     .then(function(){
  //       $('body').trigger(keypressFor('w'));
  //       return sleep();
  //     })
  //     .then(function(){
  //       $('body').trigger(keypressFor('e'));
  //       return sleep();
  //     })
  //     .then(function(){
  //       $('body').trigger(keypressFor('r'));
  //       return sleep();
  //     })
  //     .then(function(){
  //       $('body').trigger(keypressFor('t'));
  //       return sleep();
  //     })
  //     .then(function(){
  //       expect(self.keypressService.getBuffer()).eqls([]);
  //       done();
  //     })
  //     .catch(done);
  // });

  afterEach(function(){
    this.keypressService.clearBuffer();
  });

});