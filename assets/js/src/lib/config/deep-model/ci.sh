#!/bin/bash

npm install
npm dedupe

if [[ -n "$UNDERSCORE" ]]
then
	npm install underscore@"$UNDERSCORE"
fi

if [[ -n "$BACKBONE" ]]
then
	npm install backbone@"$BACKBONE"
fi

if [[ -n "$LODASH" ]]
then
	npm install lodash@"$LODASH"

	# Lodash@2 and Lodash@3 have different file structures
	if [[ "$LODASH" < "3.0" ]]
	then
		mv node_modules/lodash/lodash.js node_modules/underscore/underscore.js
	else 
		mv node_modules/lodash/index.js node_modules/underscore/underscore.js
	fi
fi
