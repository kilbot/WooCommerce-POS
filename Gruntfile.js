'use strict';
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
                    "pos_cart_params": true 
                },
                "force": true
            },
            all: [
                'Gruntfile.js',
                'public/assets/js/js-dev/**/*.js',
                'admin/assets/js/admin.js'
            ]
        },

        // uglify to concat, minify, and make source maps
        uglify: {
            lib: {
                options: {
                    sourceMap: 'public/assets/js/map/lib-map.js'
                },
                files: {
                    'public/assets/js/lib.min.js': [
                        'public/assets/js/lib/mediator.js',
                        'public/assets/js/lib/mediator.init.js',
                        'public/assets/js/lib/underscore.js',
                        'public/assets/js/lib/backbone.js',
                        'public/assets/js/lib/backbone-pageable.js',
                        'public/assets/js/lib/backbone.localStorage.js',
                        'public/assets/js/lib/backgrid.js',
                        'public/assets/js/lib/backgrid-paginator.js',
                        'public/assets/js/lib/backgrid-filter.js',
                    ]
                }
            },
            plugins: {
                options: {
                    sourceMap: 'public/assets/js/map/plugins-map.js'
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
                    sourceMap: 'public/assets/js/map/pos-map.js'
                },
                files: {
                    'public/assets/js/pos.min.js': [
                        'public/assets/js/js-dev/global.js',
                        'public/assets/js/js-dev/products.js',
                        'public/assets/js/js-dev/cart.js',
                    ]
                }
            },
            admin: {
                options: {
                    sourceMap: 'admin/assets/js/map/admin-map.js'
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

    });


    // register task
    grunt.registerTask('default', ['wp_readme_to_markdown', 'compass', 'cssmin', 'jshint', 'uglify', 'watch']);

};