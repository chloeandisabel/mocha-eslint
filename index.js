var CLIEngine = require('eslint').CLIEngine;
var chalk = require('chalk');
var globAll = require('glob-all');
var cli = new CLIEngine({});
var fs = require('fs');
var path = require('path');

function test(p, opts) {
  it('should have no errors in ' + p, function () {
    var format, warn;

    if (opts && opts.timeout) {
      this.timeout(opts.timeout);
    }

    if (opts && opts.formatter) {
      format = opts.formatter;
    }

    if (opts && opts.hasOwnProperty('alwaysWarn')) {
      warn = opts.alwaysWarn;
    } else {  // Show warnings by default
      warn = true;
    }

    var report = cli.executeOnFiles([p]);
    var formatter = cli.getFormatter(format);

    if (
      report &&
      report.errorCount > 0
    ) {
      // remove process.cwd() to convert absolute to relative paths
      var result = formatter(report.results).replace(process.cwd() + '/', '');
      if (opts && opts.logPath && opts.logExt) {
        fs.writeFile(path.join(opts.logPath, p + '.' + opts.logExt), result);
        throw new Error(chalk.red('Code did not pass lint rules'));
      } else {
        throw new Error(chalk.red('Code did not pass lint rules') + result);
      }
    } else if (
      warn &&
      report &&
      report.warningCount > 0
    ) {
      console.log(formatter(report.results));
    }

  });
}

module.exports = function (patterns, options) {
  describe('eslint', function () {
    globAll.sync(patterns).forEach(function (file) {
      test(file, options);
    });
  });
};
