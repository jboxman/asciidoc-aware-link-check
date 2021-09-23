const program = require('commander');
const chalk = require('chalk');
const fs = require('fs').promises;
const fsPath = require('path');
const yaml = require('js-yaml');

const extractLinks = require('./get-links');
const asciidocAwareLinkCheck = require('.');
const { walkTopics, readStream, parseAttributes, pairAttributes } = require('./util');

const statusLabels = {
  alive: chalk.green('✓'),
  dead: chalk.red('✖'),
  ignored: chalk.gray('~')
};

function* getIterablePaths(data, topicPath, useStdin = true) {
  if(useStdin) {
    for(const filePath of data) {
      if(filePath) yield filePath;
    }
  }
  else {
    for(const bucket of data) {
      if(bucket['Dir'] == 'rest_api') continue;
      const paths = walkTopics(bucket);
      for(const { path } of paths) {
        const inputPath = fsPath.join(fsPath.dirname(topicPath), `${path}.adoc`);
        yield inputPath;
      }
    }
  }
}

async function foundLinkDirective(filePath) {
  let found = false;
  try {
    const fileContents = await fs.readFile(filePath, { encoding: 'utf8' });
    for(const ln of fileContents.split(EOL)) {
      if(/link:https?:\/\/[^\[]+\[/.test(ln)) {
        found = true;
        break;
      }
    }
  }
  catch(err) {
    if(err.code == 'ENOENT') {
      console.error(`Cannot open ${filePath}`);
    }
  }

  return found;
}

module.exports = function({
  linkExtractor = extractLinks,
  linkChecker = asciidocAwareLinkCheck
} = {}) {

  program
    .option('-a, --attributes [attributes...]', 'Optional: Attributes such as "product-version=1".')
    .option('--csv', 'Output to stdout in CSV format. Outputs BROKEN_LINK,MODULE,LINE_NUM. This option implies --no-progress and --quiet.')
    .option('-n, --dry', 'Dry run.')
    .option('--no-progress', 'Hide progress bar.')
    //.option('-c, --config [config]', 'Use a JSON config file')
    .option('-q, --quiet', 'Display errors only.')
    .option('--stdin', 'Read file list from stdin instead of a _topic_map.yml file.', false)
    .option('--topic <path>', 'Optional: Path to ascii_binder _topic_map.yml file.')
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

  return async function(options = {}, cmd = {}) {
    let data;

    const linkCheckerOptions = {
      dryRun: (options.dry === true),
      showProgressBar: options.progress,
      // TODO - get based upon config file
      ignorePatterns: []
    };

    const cliOptions = {
      attributes: parseAttributes(options.attributes),
      csvFormat: options.csv,
      alwaysPass: options.pass,
      useStdin: options.stdin,
      quiet: (options.quiet === true),
      topicPath: (options.topic ? options.topic : fsPath.join(process.cwd(), '_topic_map.yml'))
    }

    if(cliOptions.csvFormat) {
      linkCheckerOptions.quiet = true;
      linkCheckerOptions.showProgressBar = false;
    }

    //console.log(pairAttributes(attributes));

    if(cliOptions.useStdin) {
      data = await readStream(process.stdin);
      if(!data) {
        console.log('No input on stdin');
        process.exitCode = 1;
        throw new Error();
      }
    }
    else {
      try {
        data = await fs.readFile(cliOptions.topicPath, { encoding: 'utf8' } );
      }
      catch(err) {
        if(err.code == 'ENOENT') {
          console.error(`Cannot open ${cliOptions.topicPath}`);
        }
        console.log(err.message);
        process.exitCode = 1;
        throw new Error();
      }
      data = data.split(/---\n/).slice(1);
      data = data.map(section => yaml.load(section));
    }

    const paths = getIterablePaths(data, cliOptions.topicPath, cliOptions.useStdin);
    for(const inputPath of paths) {

      if(! cliOptions.csvFormat)
        logger.log('[ℹ] Loading %s', inputPath);

      if(!foundLinkDirective(inputPath)) continue;

      const urlCatalog = linkExtractor(inputPath, { attributes: cliOptions.attributes });

      const links = urlCatalog.getUrls();

      if(! cliOptions.csvFormat && links.length <= 0)
        logger.log('[ℹ] No links found');

      const results = await linkChecker(links, linkCheckerOptions);

      for(const result of results) {
        // Skip messages for non-deadlinks in quiet mode.
        if (cliOptions.quiet && result.status !== 'dead') {
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

            if(! cliOptions.csvFormat) {
              logger.log('[%s] %s (%s:%s)', ...tokens);
              continue;
            }

            logger.log('%s,%s,%s', ...tokens.slice(1));
            break;

          case 'ignored':
            if(! cliOptions.csvFormat) {
              logger.log('[%s] %s', statusLabels[result.status], chalk.gray(result.link));
              continue;
            }
            break;

          default:
            if(! cliOptions.csvFormat) {
              logger.log('[%s] %s', statusLabels[result.status], result.link);
              continue;
            }
            break;
        }

      }
    }
  }
}
