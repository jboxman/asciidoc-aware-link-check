import { describe } from 'riteway';
const path = require('path');
const promisfy = require('util').promisify;
const exec = promisfy(require('child_process').exec);

// Without a subprocess, commander.js seems to eat argv when parseAsync is used
// error: unknown option '-r'

const cli = require('../lib/cli');
const f = cli.actionWithOptions;

const linkExtractor = require('../lib/get-links');
const linkChecker = require('../lib');
const linkCheck = require('../lib/link-check');

const {
  logger
} = require('./util');

const {
  ignoreUrls,
  goodUrls
} = require('./fixtures/urls');

describe('CLI', async assert => {
  const log = logger();
  const opts = { showProgressBar: false };
  const overrides = { linkExtractor, linkChecker, logger: log };

  await f({ ...overrides, linkExtractor: ignoreUrls })(path.join(__dirname, './fixtures/adoc/main.adoc'), opts);

  assert({
    given: 'links that match ignore list',
    should: 'ignore links',
    actual: log.getLog('stdout').filter(l => l.includes('~')).length,
    expected: 10
  });

  linkCheck.setFake().dead();
  await f({ ...overrides, linkExtractor: goodUrls })(path.join(__dirname, './fixtures/adoc/main.adoc'), opts);

  assert({
    given: 'valid links that are broken',
    should: 'output a list of broken links',
    actual: log.getLog('stdout').filter(l => l.includes('✖')).length,
    expected: 1
  });

  linkCheck.setFake().alive();
  await f({ ...overrides, linkExtractor: goodUrls })(path.join(__dirname, './fixtures/adoc/main.adoc'), opts);

  assert({
    given: 'valid links that are working',
    should: 'output a list of working links',
    actual: log.getLog('stdout').filter(l => l.includes('✓')).length,
    expected: 1
  });

  //await f({ ...overrides, linkExtractor: goodUrls })(path.join(__dirname, './fixtures/adoc/main.adoc'), opts)
  //  .catch(e => e);
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
