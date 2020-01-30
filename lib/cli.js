const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');

const extractLinks = require('./get-links');
const asciidocAwareLinkCheck = require('.');

const statusLabels = {
  alive: chalk.green('✓'),
  dead: chalk.red('✖'),
  ignored: chalk.gray('~')
};

module.exports = function({
  linkExtractor = extractLinks,
  linkChecker = asciidocAwareLinkCheck
} = {}) {

  program
    .arguments('[assemblyFile]')
    .option('--no-progress', 'Show progress bar')
    //.option('-c, --config [config]', 'Use a JSON config file')
    .option('-q, --quiet', 'Display errors only')
    .option('-n, --dry', 'Dry run')
    .action(main({ linkExtractor, linkChecker }));

  return {
    start(...args) {
      if(args.length > 0) {
        return program.parseAsync(...args);
      }
      else {
        return program.parseAsync(process.argv);
      }
    }
  }
}

module.exports.actionWithOptions = main;

function main({ linkExtractor, linkChecker, logger = console }) {

  if(! linkExtractor) {
    logger.error('`linkExtractor` must be defined.');
    process.exit(1);
  }

  if(! linkChecker) {
    logger.error('`linkChecker` must be defined.');
    process.exit(1);
  }

  return async function(assemblyFile, cmd = {}) {

    const options = {
      quiet: (cmd.quiet === true),
      dryRun: (cmd.dry === true),
      showProgressBar: cmd.progress,
      // TODO - get based upon config file
      ignorePatterns: false
    };

    if(!fs.existsSync(assemblyFile)) {
      logger.error(chalk.red(`You must specify an assembly file.`));
      throw new Error();
    }

    logger.log('[I] Loading %s', assemblyFile);

    const urlCatalog = linkExtractor(assemblyFile, options);
    const links = urlCatalog.getUrls();

    if(links.length <= 0)
      logger.log('[I] No links found');

    const results = await linkChecker(links, options);

    results.forEach(function (result) {
      // Skip messages for non-deadlinks in quiet mode.
      if (options.quiet && result.status !== 'dead') {
        return;
      }

      switch(result.status) {
        case 'dead':
          const { sourceFile, lineNumber } = urlCatalog.getUrl(result.link);

          const tokens = [
            statusLabels[result.status],
            chalk.red(result.link),
            sourceFile,
            lineNumber
          ];

          logger.log('[%s] %s (%s:%s)', ...tokens);
          break;

        case 'ignored':
          logger.log('[%s] %s', statusLabels[result.status], chalk.gray(result.link));
          break;

        default:
          logger.log('[%s] %s', statusLabels[result.status], result.link);
      }

    });
  }
}
