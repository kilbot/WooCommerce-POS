module.exports = function() {
  var W = this.Widget;

  this.When(/^I use the barcode hotkey$/, function () {
    new this.Widget({
      root: "body"
    }).sendKeys({
      keys: [
        "\uE009", // cntr
        "b",
      ]
    });
  });

  this.Then(/^I should be in barcode mode$/, function () {
    return new W.ProductFilter()
      .hasClass({
        selector: ".dropdown .icon",
        className: "icon-barcode"
      });
  });

  this.When(/^I search for barcodes starting with 'woo'$/, function() {
    new W.ProductFilter().sendKeys({
        selector: "input",
        keys: "woo"
      });
  });

  this.Then(/^I should see only products with 'woo' in the barcode$/, function() {
    return new W.ProductList().length().should.eventually.eql(1);
  });

  this.When(/^I click the dropdown$/, function() {
    return new W.ProductFilter().click({ selector: '.dropdown a' });
  });

  this.Then(/^I click the normal search mode$/, function() {
    return new W.ProductFilter().click({ selector: '[data-action="search"]' });
  });

  this.Then(/^I should see 7 products$/, function() {
    return new W.ProductList().length().should.eventually.eql(7);
  });

  this.When(/^I use the barcode hotkey \+ 'woo'$/, function() {
    new this.Widget({
      root: "body"
    }).sendKeys({
        keys: [
          "\uE009", // cntr
          "bwoo"
        ]
      });
  });


}