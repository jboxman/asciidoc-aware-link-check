import { describe } from 'riteway';
const path = require('path');
const promisfy = require('util').promisify;
const exec = promisfy(require('child_process').exec);
const format = require('util').format;

// Without a subprocess, commander.js seems to eat argv when parseAsync is used
// error: unknown option '-r'

const cli = require('../lib/cli');
const f = cli.actionWithOptions;

const createUrlCatalog = require('../lib/url-catalog');
const linkExtractor = require('../lib/get-links');
const linkChecker = require('../lib');

const urls = require('./fixtures/urls');

function logger() {
  const logs = {
    stdout: [],
    stderr: []
  };

  return {
    log(v) {
      return logs['stdout'].push(format(v, ...Array.from(arguments).slice(1)));
    },

    error(v) {
      return logs['stderr'].push(format(v, ...Array.from(arguments).slice(1)));
    },

    getLog(key) {
      return logs[key];
    },

    reset() {
      for(const key of ['stdout', 'stderr']) {
        logs[key] = [];
      }
    }
  }
}

function testExtractor() {
  const catalog = createUrlCatalog();

  urls.forEach(url => {
    catalog.addUrl(
      url,
      {
        linkType: 'external',
        linkText: 'text',
        sourceFile: 'file',
        sourceDirectory: 'dir',
        lineNumber: 1
      });
  });

  return catalog;
}

describe('CLI', async assert => {
  const log = logger();
  const opts = { showProgressBar: false };
  const overrides = { linkExtractor, linkChecker, logger: log };

  //await f(opts)('../rhev-docs/doc-Administration_Guide/master.adoc');

  await f({ ...overrides,  linkExtractor: testExtractor })(path.join(__dirname, './fixtures/adoc/main.adoc'), opts);

  assert({
    given: 'list of links',
    should: 'output a list of links',
    actual: log.getLog('stdout').filter(l => l.includes('✓')).length,
    expected: 10
  });
});

describe('CLI childprocess', async assert => {
  let stdout, stderr;

  try {
    ({ stdout } = await exec(`node asciidoc-aware-link-check`));
  }
  catch(error) {
    ({ stderr } = error);
  }

  assert({
    given: 'no assembly file',
    should: 'exit with an error',
    actual: /specify/.test(stderr.trim()),
    expected: true
  });

});
