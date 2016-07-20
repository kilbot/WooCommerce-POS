## backbone-deep-model

[![Build Status](https://travis-ci.org/kahwee/backbone-deep-model.svg?branch=master)](https://travis-ci.org/kahwee/backbone-deep-model) [![Coverage Status](https://coveralls.io/repos/kahwee/backbone-deep-model/badge.svg?branch=master)](https://coveralls.io/r/kahwee/backbone-deep-model?branch=master) [![Code Climate](https://codeclimate.com/github/kahwee/backbone-deep-model/badges/gpa.svg)](https://codeclimate.com/github/kahwee/backbone-deep-model)

Forked from https://github.com/powmedia/backbone-deep-model (Thanks for the wonderful work @powmedia!)

The test cases are rewritten. This is primarily a browserify package. I'll work on making this work in other platforms if there is interest.

Improved support for models with nested attributes.

Allows you to get and set nested attributes with path syntax, e.g. `user.type`.

Triggers change events for changes on nested attributes.

Dependencies
============

* Backbone >= 1.0.0
* Underscore >= 1.4.4 or Lodash v2.4.x or Lodash v3.x.x

Installation
============

1. Include Backbone and it's dependencies in your page/app.
2. Include `dist/backbone-deep-model.min.js`

Usage
=====

Then just have your models extend from Backbone.DeepModel instead of Backbone.Model.

Example code:

```javascript
//Create models with nested attributes
var model = new Backbone.DeepModel({
    id: 123,
    user: {
        type: 'Spy',
        name: {
            first: 'Sterling',
            last: 'Archer'
        }
    },
    otherSpies: [
        { name: 'Lana' },
        { name: 'Cyrril' }
    ]
});

//You can bind to change events on nested attributes
model.on('change:user.name.first', function(model, val) {
    console.log(val);
});

//Wildcards are supported
model.on('change:user.*', function() {});

//Use set with a path name for nested attributes
//NOTE you must you quotation marks around the key name when using a path
model.set({
    'user.name.first': 'Lana',
    'user.name.last':  'Kang'
});

//Use get() with path names so you can create getters later
console.log(model.get('user.type'));    // 'Spy'

//You can use index notation to fetch from arrays
console.log(model.get('otherSpies.0.name')) //'Lana'
```

Author
======

Charles Davison - [powmedia](http://github.com/powmedia)


Contributors
============

- [mattyway](https://github.com/mattyway)
- [AsaAyers](https://github.com/AsaAyers)


Changelog
=========

master:
* Lodash v3.x.x support.
* Significant refactor
* Add supprt for arrays in nested attributes (sqren)

0.11.0:
- Trigger change events only once (restorer)

0.10.4:
- Fix #68 Model or collection in attributes are eliminated when defaults are used

0.10.0:
- Support Backbone 0.9.10

0.9.0:
- Support Backbone 0.9.9 (mattyway)
- Add support for deep model defaults (mattyway)

0.8.0:
- Allow nested attribute as Model identifier (milosdakic)
- Add AMD support (drd0rk)
- Added "change:*" event triggers for ancestors of nested attributes. (jessehouchins)
- JSHint linting (tony)
- Fix: undefined in setNested resulting from a recent change in backbone master. (evadnoob)

0.7.4:
- Fix: #22 model.hasChanged() is not reset after change event fires
- Fix: #18 Setting a deep property to the same value deletes the property (mikefrey)
- Allow setting nested attributes inside an attribute whose value is currently null (sqs)

0.7.3:
- Add DeepModel.keyPathSeparator to allow using custom path separators

0.7.2:
- Check if the child object exists, but isn't an object. #12 (tgriesser)

0.7.1:
- Model.changedAttributes now works with nested attributes.
- Fix getting attribute that is an empty object

0.7:
- Update for Backbone v0.9.2
