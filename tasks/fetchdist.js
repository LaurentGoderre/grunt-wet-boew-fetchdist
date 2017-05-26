var path = require('path');
var fetchdist = require('../lib/fetchdist');

module.exports = function(grunt) {
	grunt.registerMultiTask('wb-fetchdist', 'Update working examples', function () {
		var options = this.options(),
		dest, done;

		if (!options.dest){
			return grunt.fail.warn('Mandatory option \'dest\' not found.');
		}

		if (!options.fallbackTask){
			return grunt.fail.warn('Mandatory option \'fallbackTask\' not found.');
		}

		dest = path.join(process.cwd(), options.dest);

		if (!grunt.file.exists(dest)) {
			grunt.file.mkdir(dest);
		}

		done = this.async();
		fetchdist.getBuiltArtifact(options.dest, function(error) {
			if (error) {
				grunt.log.error(`Could not fetch due to error '${error}'. Running fallback task '${options.fallbackTask}'`);
				grunt.task.run(options.fallbackTask);
			}

			done();
		});
	});
};
