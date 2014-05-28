module.exports = function(grunt) {

	// load all grunt tasks matching the `grunt-*` pattern
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		// watch for changes and trigger sass, jshint, uglify and livereload
		watch: {
			compass: {
				files: ['public/assets/css/sass/{,*/}*.{scss,sass}', 'public/assets/css/pos.css', 'admin/assets/css/admin.css'],
				tasks: ['compass:dev', 'cssmin']
			},
			js: {
				files: '<%= jshint.all %>',
				tasks: ['jshint']
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
					'admin/assets/css/admin.min.css':['admin/assets/css/admin.css']
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
				'!public/assets/js/scripts.min.js',
				'!public/assets/js/require.js',
				'!public/assets/js/vendor/**/*.js',
			]
		},

		requirejs: {
			compile: {
				options: {
					baseUrl: 'public/assets/js',
					mainConfigFile: 'public/assets/js/main.js',
					name: 'main',
					out: 'public/assets/js/scripts.min.js',
					preserveLicenseComments: false,
					paths: {
						almondLib: '../../../bower_components/almond/almond'
					},
					include: 'almondLib',
				}
			}
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
		}

	});


	// register task
	grunt.registerTask('default', ['makepot', 'wp_readme_to_markdown', 'compass', 'cssmin', 'jshint', 'requirejs', 'watch']);

};