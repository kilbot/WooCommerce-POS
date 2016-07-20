'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap');

var name = require('./package.json').name;

gulp.task('browserify', function() {
	var bundler = browserify({
		entries: ['./src/browser.js']
	});
	var bundle = function() {
		return bundler
			.exclude('backbone')
			.exclude('underscore')
			.exclude('lodash')
			.bundle()
			.pipe(source(name + '.js'))
			.pipe(buffer())
			.pipe(gulp.dest('./dist/'))
			.pipe(rename(name + '.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('./dist/'));
	};

	return bundle();
});

gulp.task('default', ['browserify']);
