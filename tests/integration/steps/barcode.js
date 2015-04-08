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
      })
  });


}