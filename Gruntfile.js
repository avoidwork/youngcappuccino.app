module.exports = grunt => {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		eslint: {
			target: [
				"Gruntfile.js",
				"www/assets/js/*.js"
			]
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-eslint");

	// aliases
	grunt.registerTask("test", ["eslint"]);
	grunt.registerTask("default", ["test"]);
};
