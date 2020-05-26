const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

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
    .arguments('ASSEMBLY_FILE')
    .option('--no-progress', 'Hide progress bar.')
    //.option('-c, --config [config]', 'Use a JSON config file')
    .option('-q, --quiet', 'Display errors only.')
    .option('--csv', 'Output to stdout in CSV format. Outputs BROKEN_LINK,MODULE,LINE_NUM. If you want to create a CSV file, either copy the output from stdout to a text file after running the tool, or redirect the output to a text file. This option implies --no-progress and --quiet.')
    .option('-n, --dry', 'Dry run.')
    .option('--asciibinder', 'Support asciibinder style include directives.')
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
      csvFormat: cmd.csv,
      useAsciibinderStyleIncludes: (cmd.asciibinder === true),
      // TODO - get based upon config file
      ignorePatterns: []
    };

    if(options.csvFormat) {
      options.quiet = true;
      options.showProgressBar = false;
    }

    // TODO - accept URLs via STDIN
    if(! fs.existsSync(assemblyFile)) {
      logger.error(chalk.red(`You must specify an assembly file.`));
      throw new Error();
    }

    if(options.useAsciibinderStyleIncludes) {
      if(! fs.existsSync(path.join(process.cwd(), '_distro_map.yml'))) {
        logger.error(chalk.red(`No '_distro_map.yml' file found in working directory.`));
        throw new Error();
      }
    }

    if(! options.csvFormat)
      logger.log('[I] Loading %s', assemblyFile);

    const urlCatalog = linkExtractor(assemblyFile, options);

    const links = urlCatalog.getUrls();

    if(! options.csvFormat && links.length <= 0)
      logger.log('[I] No links found');

    const results = await linkChecker(links, options);

    for(const result of results) {
      // Skip messages for non-deadlinks in quiet mode.
      if (options.quiet && result.status !== 'dead') {
        continue;
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

          if(! options.csvFormat) {
            logger.log('[%s] %s (%s:%s)', ...tokens);
            continue;
          }

          logger.log('%s,%s,%s', ...tokens.slice(1));
          break;

        case 'ignored':
          if(! options.csvFormat) {
            logger.log('[%s] %s', statusLabels[result.status], chalk.gray(result.link));
            continue;
          }
          break;

        default:
          if(! options.csvFormat) {
            logger.log('[%s] %s', statusLabels[result.status], result.link);
            continue;
          }
          break;
      }

    }
  }
}
