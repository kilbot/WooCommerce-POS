this["POS"] = this["POS"] || {};
this["POS"]["Components"] = this["POS"]["Components"] || {};
this["POS"]["Components"]["Numpad"] = this["POS"]["Components"]["Numpad"] || {};

this["POS"]["Components"]["Numpad"]["HeaderTmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "	<input type=\"text\" value=\""
    + escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"value","hash":{},"data":data}) : helper)))
    + "\" class=\"form-control pull-right autogrow\">\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, helper, helperMissing=helpers.helperMissing, functionType="function", buffer = "	<div class=\"input-group pull-right\">\n		<span class=\"input-group-btn\">\n			<button class=\"btn btn-default\" type=\"button\" data-modifier=\"amount\" ";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "amount", {"name":"is","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += ">";
  stack1 = ((helper = (helper = helpers.currency_symbol || (depth0 != null ? depth0.currency_symbol : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"currency_symbol","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n		</span>\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "amount", {"name":"is","hash":{},"fn":this.program(6, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "percentage", {"name":"is","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "		<span class=\"input-group-btn\">\n			<button class=\"btn btn-default\" type=\"button\" data-modifier=\"percentage\" ";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "percentage", {"name":"is","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += ">%</button>\n		</span>\n	</div>\n	<span class=\"input-alt pull-right\">\n	";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "amount", {"name":"is","hash":{},"fn":this.program(10, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n	";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.mode : depth0), "percentage", {"name":"is","hash":{},"fn":this.program(12, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n	</span>\n";
},"4":function(depth0,helpers,partials,data) {
  return "disabled";
  },"6":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "		<input type=\"text\" value=\""
    + escapeExpression(((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, (depth0 != null ? depth0.value : depth0), {"name":"number","hash":{},"data":data})))
    + "\" class=\"form-control autogrow\">\n";
},"8":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "		<input type=\"text\" value=\""
    + escapeExpression(((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, (depth0 != null ? depth0.percentage : depth0), {"name":"number","hash":{
    'precision': ("auto")
  },"data":data})))
    + "\" class=\"form-control autogrow\">\n";
},"10":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, (depth0 != null ? depth0.percentage : depth0), {"name":"number","hash":{
    'precision': (0)
  },"data":data})))
    + "% off";
},"12":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing;
  stack1 = ((helpers.money || (depth0 && depth0.money) || helperMissing).call(depth0, (depth0 != null ? depth0.value : depth0), {"name":"money","hash":{},"data":data}));
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"14":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "	<div class=\"input-group pull-right\">\n		<span class=\"input-group-btn\">\n			<button class=\"btn btn-default\" type=\"button\" data-qty=\"decrease\"><i class=\"icon icon-minus\"></i></button>\n		</span>\n		<input type=\"text\" value=\""
    + escapeExpression(((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, (depth0 != null ? depth0.value : depth0), {"name":"number","hash":{
    'precision': ("auto")
  },"data":data})))
    + "\" class=\"form-control autogrow\">\n		<span class=\"input-group-btn\">\n			<button class=\"btn btn-default\" type=\"button\" data-qty=\"increase\"><i class=\"icon icon-plus\"></i></button>\n		</span>\n	</div>\n";
},"16":function(depth0,helpers,partials,data) {
  var helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "	<input type=\"text\" value=\""
    + escapeExpression(((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, (depth0 != null ? depth0.value : depth0), {"name":"number","hash":{},"data":data})))
    + "\" class=\"form-control pull-right autogrow\">\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<strong class=\"title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</strong>\n\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "standard", {"name":"is","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.show_discount_input : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "quantity", {"name":"is","hash":{},"fn":this.program(14, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "cash", {"name":"is","hash":{},"fn":this.program(16, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});



this["POS"]["Components"]["Numpad"]["NumkeysTmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "<table class=\"discount pull-right\">\n	<tr>\n		<td><button data-key=\"5\" class=\"btn btn-default\">5%</button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"10\" class=\"btn btn-default\">10%</button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"20\" class=\"btn btn-default\">20%</button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"25\" class=\"btn btn-default\">25%</button></td>\n	</tr>\n</table>\n";
  },"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<table class=\"cash pull-right\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.quick_key : depth0), {"name":"each","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</table>\n";
},"4":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, helperMissing=helpers.helperMissing, buffer = "	<tr>\n		<td><button data-key=\"";
  stack1 = lambda(depth0, depth0);
  if (stack1 != null) { buffer += stack1; }
  buffer += "\" class=\"btn btn-default\">";
  stack1 = ((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, depth0, {"name":"number","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</button></td>\n	</tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<table class=\"standard pull-left\">\n	<tr>\n		<td><button data-key=\"1\" class=\"btn btn-default\">1</button></td>\n		<td><button data-key=\"2\" class=\"btn btn-default\">2</button></td>\n		<td><button data-key=\"3\" class=\"btn btn-default\">3</button></td>\n		<td><button data-key=\"del\" class=\"btn btn-default\"><i class=\"icon icon-delete\"></i></button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"4\" class=\"btn btn-default\">4</button></td>\n		<td><button data-key=\"5\" class=\"btn btn-default\">5</button></td>\n		<td><button data-key=\"6\" class=\"btn btn-default\">6</button></td>\n		<td><button data-key=\"+/-\" class=\"btn btn-default\">+/-</button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"7\" class=\"btn btn-default\">7</button></td>\n		<td><button data-key=\"8\" class=\"btn btn-default\">8</button></td>\n		<td><button data-key=\"9\" class=\"btn btn-default\">9</button></td>\n		<td rowspan=\"2\"><button data-key=\"ret\" class=\"btn btn-default return\"><small>return</small></button></td>\n	</tr>\n	<tr>\n		<td><button data-key=\"0\" class=\"btn btn-default\">0</button></td>\n		<td><button data-key=\"00\" class=\"btn btn-default\">00</button></td>\n		<td><button data-key=\".\" class=\"btn btn-default\">"
    + escapeExpression(((helper = (helper = helpers.decimal || (depth0 != null ? depth0.decimal : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"decimal","hash":{},"data":data}) : helper)))
    + "</button></td>\n	</tr>\n</table>\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.show_discount_keys : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.show_cash_keys : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});