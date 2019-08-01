var gulp = require("gulp");
var requireDir = require("require-dir");

var tasks = requireDir("./gulp/tasks");

// Default
// gulp.task("default", ["prepare-all-alliances-combinations"]);
gulp.task("default", ["prepare-all-alliances-data"]);