module.exports = function(grunt) {

  grunt.initConfig({
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

    clean: {
      files: ['build/']
    }

  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['copy']);
  grunt.registerTask('release', ['clean', 'build']);
};
