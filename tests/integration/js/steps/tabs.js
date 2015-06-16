module.exports = function() {
  var W = this.Widget;

  this.When(/^I click on the 'On Sale' tab$/, function () {
    return new W.ProductTabs().click({ selector: 'ul li:last-of-type' });
  });

  this.Then(/^I should see 5 products$/, function () {
    return new W.ProductList().length().should.eventually.eql(5)
  });

}