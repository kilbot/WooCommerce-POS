module.exports = function(){
  var W = this.Widget;

  this.Given(/^I have logged in to the POS$/, function() {
    return this.login('demo', 'demo');
  });

  this.Then(/^I should see the Products module$/, function() {
    return new W.ProductsModule().isPresent().should.eventually.be.true;
  });

  this.Then(/^I should count at least 10 products$/, function() {
    return new W.ProductList().length().should.eventually.be.at.least(10)
  });

  this.When(/^I scroll down$/, function() {
    var list = new W.ProductList();
    var self = this;

    return list.length().then(function(length){
      return list.at(length - 1).then(function(item){
        self.driver.executeScript("arguments[0].scrollIntoView(true);", item.el);
      });
    });
  });

  //this.Then(/^I should see more products$/, function() {
  //  return new W.ProductList().length().should.eventually.be.at.least(20)
  //});
  //
  //this.When(/^I scroll down again$/, function() {
  //  var list = new W.ProductList();
  //  var self = this;
  //
  //  return list.length().then(function(length){
  //    return list.at(length - 1).then(function(item){
  //      self.driver.executeScript("arguments[0].scrollIntoView(true);", item.el);
  //    });
  //  });
  //});
  //
  //this.Then(/^I should see a total of 23 products$/, function(count) {
  //  return new W.ProductList().length().should.eventually.eql(23)
  //});


  this.When(/^I search for 'happy'$/, function() {
    new W.ProductFilter().sendKeys({
      selector: "input",
      keys: [
        "happy"
      ]
    });
  });

  this.Then(/^I should see 2 products$/, function() {
    return new W.ProductList().length().should.eventually.eql(2)
  });

}