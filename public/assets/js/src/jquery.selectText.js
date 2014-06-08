/**
 * jquery plugin to select all text in an element
 * taken from http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
 */


define(['jquery'], function($) {

	$.fn.extend({
		selectText: function() {
			var doc = document;
			var element = this[0];
			if (doc.body.createTextRange) {
				var range = document.body.createTextRange();
				range.moveToElementText(element);
				range.select();
			} else if (window.getSelection) {
				var selection = window.getSelection();	
				var range = document.createRange();
				range.selectNodeContents(element);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		},
	});

});