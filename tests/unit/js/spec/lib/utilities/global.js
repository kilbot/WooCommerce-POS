describe('lib/utilities/global.js', function () {

  var POS = require('lib/utilities/global');
  var Marionette = require('backbone.marionette');

  beforeEach(function () {
    this.POS = _.clone(POS);
  });

  describe('global POS', function () {

    it('should return an object', function () {
      expect(this.POS).to.be.an('object');
    });

    it('should attach nested properties', function () {
      this.POS.attach('Module.SubModule.SubSubModule');
      expect(this.POS).to.have.property('Module');
      expect(this.POS).to.have.deep.property('Module.SubModule');
      expect(this.POS).to.have.deep.property('Module.SubModule.SubSubModule');
    });

    it('should attach and not overwrite existing properties', function () {
      this.POS.Module = { foo: 'bar' };
      this.POS.attach('Module.SubModule');
      expect(this.POS).to.have.property('Module')
        .that.is.an('object')
        .that.deep.equals({ SubModule: {}, foo: 'bar' });
    });

    it('should also accept a value when creating nested properties', function () {
      this.POS.attach('Module.SubModule', { foo: 'bar' });
      expect(this.POS).to.have.deep.property('Module.SubModule.foo', 'bar');
    });

    it('should create a global Marionette App with custom properties', function () {
      var app = new Marionette.Application();
      this.POS.attach('Module.SubModule', { foo: 'bar' });
      var POS = this.POS.create(app);
      POS.module('Module');
      expect(POS).to.be.an.instanceof(Marionette.Application);
      expect(POS).to.have.deep.property('Module.SubModule.foo', 'bar');
    });


  });

});