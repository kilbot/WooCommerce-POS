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
                tasks: ['jshint', 'uglify']
            },
            readme: {
                files: 'readme.txt',
                tasks: ['wp_readme_to_markdown']
            }
            // php: {
            //     files: ['*.php', 'includes/{,*/}*.php'],
            // },
            // options: {
            //     livereload: true,
            //     spawn: false
            // }
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
                    "jQuery": true,
                    "alert": true,
                    "pos_cart_params": true,
                    "Backbone": true,
                    "Modernizr": true,
                    "mediator": true,
                    "_": true,
                },
                "force": true
            },
            all: [
                'Gruntfile.js',
                'public/assets/js/build/**/*.js',
                'admin/assets/js/admin.js'
            ]
        },

        // uglify to concat, minify, and make source maps
        uglify: {
            lib: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/assets/js/map/lib.map'
                    // compress: {
                    //     drop_console: true
                    // }
                },
                files: {
                    'public/assets/js/lib.min.js': [
                        'public/assets/js/lib/mediator.js',
                        'public/assets/js/lib/mediator.init.js',
                        'public/assets/js/lib/underscore.js',
                        'public/assets/js/lib/backbone.js',
                        'public/assets/js/lib/backbone.paginator.js',
                        'public/assets/js/lib/backbone-indexeddb.js',
                        'public/assets/js/lib/deep-model.js',
                    ]
                }
            },
            plugins: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/assets/js/map/plugins.map',
                    // compress: {
                        // drop_console: true
                    // }
                },
                files: {
                    'public/assets/js/plugins.min.js': [
                        'public/assets/js/vendor/**/*.js',
                        '!public/assets/js/vendor/modernizr*.js'
                    ]
                }
            },
            pos: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/assets/js/map/pos.map',
                    compress: {
                        // drop_console: true
                    }
                },
                files: {
                    'public/assets/js/pos.min.js': [
                        'public/assets/js/build/global.js',
                        'public/assets/js/build/products.js',
                        'public/assets/js/build/cart.js',
                        'public/assets/js/build/checkout.js',
                    ]
                }
            },
            admin: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'admin/assets/js/map/admin.map',
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    'admin/assets/js/admin.min.js': [
                        'admin/assets/js/admin.js'
                    ]
                }
            }
        },

        // // image optimization
        // imagemin: {
        //     dist: {
        //         options: {
        //             optimizationLevel: 7,
        //             progressive: true,
        //             interlaced: true
        //         },
        //         files: [{
        //             expand: true,
        //             cwd: 'assets/',
        //             src: ['**/*.{png,jpg,gif}'],
        //             dest: 'assets/'
        //         }]
        //     }
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
    grunt.registerTask('default', ['makepot', 'wp_readme_to_markdown', 'compass', 'cssmin', 'jshint', 'uglify', 'watch']);

};