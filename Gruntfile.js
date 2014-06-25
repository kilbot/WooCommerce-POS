module.exports = function(grunt) {

	// load all grunt tasks matching the `grunt-*` pattern
	require('load-grunt-tasks')(grunt);

	var _ = grunt.util._;

	var locales = ['nl_NL', 'fr_FR', 'es_ES', 'pt_BR'];

	grunt.initConfig({

		// watch for changes and trigger sass, jshint, uglify and livereload
		watch: {
			compass: {
				files: ['public/assets/css/sass/{,*/}*.{scss,sass}', 'public/assets/css/pos.css', 'admin/assets/css/admin.css', 'admin/assets/css/dashicons.css'],
				tasks: ['compass:dev', 'cssmin']
			},
			js: {
				files: '<%= jshint.all %>',
				tasks: ['jshint', 'uglify']
			},
		},

		// compass
		compass: {
			dev: {
				options: {
					require: ['susy', 'breakpoint'],
					sassDir: 'public/assets/css/sass',
					cssDir: 'public/assets/css',
					fontsDir: 'public/assets/fonts',
					javascriptsDir: 'public/assets/js',
					imagesDir: 'assets',
					relativeAssets: true,
				}
			}
		},

		// css minify
		cssmin: {
			options: {
				keepSpecialComments: 1
			},
			minify: {
				files: {
					'public/assets/css/pos.min.css': ['public/assets/css/pos.css'],
					'admin/assets/css/admin.min.css':['admin/assets/css/admin.css'],
					'admin/assets/css/dashicons.min.css':['admin/assets/css/dashicons.css']
				}
			}
		},

		// javascript linting with jshint
		jshint: {
			options: {
				"bitwise": true,
				"browser": true,
				"curly": true,
				"eqeqeq": true,
				"eqnull": true,
				// "es5": true,
				"esnext": true,
				"immed": true,
				"jquery": true,
				"latedef": true,
				"newcap": true,
				"noarg": true,
				"node": true,
				"strict": false,
				"trailing": true,
				"undef": true,
				"globals": {
					"define": true,
					"alert": true,
					"pos_params": true,
					"Modernizr": true,
					"_": true,
				},
				"force": true
			},
			all: [
				'Gruntfile.js',
				'public/assets/js/**/*.js',
				'admin/assets/js/admin.js',
				'!public/assets/js/pos.min.js',
				'!public/assets/js/scripts.min.js',
				'!public/assets/js/plugins.min.js',
				'!public/assets/js/worker.min.js',
				'!public/assets/js/support.min.js',
				'!public/assets/js/require.js',
				'!public/assets/js/vendor/**/*.js',
				'tests/data/**/*.json',
				'tests/specs/**/*.js',
				'tests/main.js',
			]
		},

		requirejs: {
			compile: {
				options: {
					baseUrl: 'public/assets/js',
					mainConfigFile: 'public/assets/js/main.js',
					name: 'main',
					out: 'public/assets/js/pos.min.js',
					preserveLicenseComments: false,
					paths: {
						almondLib: '../../../bower_components/almond/almond'
					},
					include: 'almondLib',
					// optimize: 'none'
					uglify2: {
						compress: {
                        	drop_console: true
                    	}
					}
				}
			}
		},

		uglify: {
			worker: {
				options: {
                    compress: {
                        drop_console: true
                    }
                },
				files: {
					'public/assets/js/worker.min.js' : [
						'public/assets/js/src/worker.js'
					]
				}
			},
			plugins: {
				files: {
					'public/assets/js/plugins.min.js' : [
						'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/dropdown.js',
						'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal.js',
						// 'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/popover.js',
						// 'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip.js',
						'public/assets/js/src/pushy.js',
					]
				}
			},
			support: {
				files: {
					'public/assets/js/support.min.js' : [
						'public/assets/js/src/support.js',
					]
				}
			},
		},

		// // image optimization
		// imagemin: {
		//	 dist: {
		//		 options: {
		//			 optimizationLevel: 7,
		//			 progressive: true,
		//			 interlaced: true
		//		 },
		//		 files: [{
		//			 expand: true,
		//			 cwd: 'assets/',
		//			 src: ['**/*.{png,jpg,gif}'],
		//			 dest: 'assets/'
		//		 }]
		//	 }
		// },

		// unused
		// convert readme.txt to readme.md
		wp_readme_to_markdown: {
			woopos: {
				files: {
					'README.md': 'readme.txt'
				}
			}
		},

		// Localize
		makepot: {
			target: {
				options: {
					cwd: '',
					domainPath: '/languages',
					mainFile: 'woocommerce-pos.php',
					potFilename: 'woocommerce-pos.pot',
					processPot: function( pot, options ) {
						pot.headers['report-msgid-bugs-to'] = 'https://github.com/kilbot/WooCommerce-POS/issues';
						pot.headers['language-team'] = 'Team Name <team@example.com>';
						return pot;
					},
					type: 'wp-plugin'
				}
			}
		},

		// unused
		shell: {
			options: {
				failOnError: true
			},
			msgmerge: {
				command: _.map(locales, function(locale) {
					var po = 'languages/woocommerce-pos-' + locale + '.po';
					return 'if [ -f "' + po + '" ]; then\n' + 
					'echo "Updating "' + po + '\n' + 
					'msgmerge ' + po + ' languages/woocommerce-pos.pot > .new.po.tmp\n' +
					'exitCode=$?\n' +
					'if [ $exitCode -ne 0 ]; then\n' +
					'echo "Msgmerge failed with exit code $?"\n' +
					'exit $exitCode\n' +
					'fi\n' +
					'mv .new.po.tmp ' + po + '\n' +
					'else\n' + 
					'echo ' + po + '" not found"\n' +
					'fi\n';
				}).join('')
			}
		},

		// unused
		po2mo: {
    		files: {
      			src: 'languages/*.po',
      			expand: true,
    		},
  		},

	});


	// register task
	grunt.registerTask('default', ['makepot', 'compass', 'cssmin', 'jshint', 'uglify', 'requirejs', 'watch']);

};