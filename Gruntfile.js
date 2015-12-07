module.exports = function(grunt) {

  grunt.initConfig({

    less: {
      options: {
        cleancss: true
      },
      main: {
        files: {
          'build/css/style.css': 'src/less/style.less'
        }
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/fonts/', src: '**', dest: 'build/fonts/'},
          {expand: true, cwd: 'node_modules/bootstrap/fonts/', src: '**', dest: 'build/fonts/'},
          {expand: true, cwd: 'node_modules/font-awesome/fonts/', src: '**', dest: 'build/fonts/'},
          {expand: true, cwd: 'node_modules/octicons/octicons/', src: '*.eot', dest: 'build/fonts/'},
          {expand: true, cwd: 'node_modules/octicons/octicons/', src: 'octicons.woff', dest: 'build/fonts/'},
          {expand: true, cwd: 'node_modules/octicons/octicons/', src: '*.ttf', dest: 'build/fonts/'}
        ]
      }
    },

    watch: {
      less: {
        files: 'src/less/*',
        tasks: ['less'],
      }
    },

    clean: {
      files: ['build/']
    }

  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', function () {
    grunt.file.mkdir('build/js');
    grunt.task.run(['less', 'copy']);
  });
  grunt.registerTask('release', ['clean', 'build']);
};
