const async = require('async');
const linkCheck = require('./link-check');
const ProgressBar = require('progress');

async function asciidocAwareLinkCheck(links, options = {}) {
  const { showProgressBar, ignorePatterns, dryRun } = options;

  const bar = new ProgressBar('Checking... [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 25,
      total: links.length
  });

  return await async.mapLimit(links, 2, function (link, callback) {
    if(! /^https?/.test(link)) {
      const linkCheckResult = {};

      linkCheckResult.link = link;
      linkCheckResult.statusCode = 0;
      linkCheckResult.status = 'ignored';

      if(showProgressBar)
        bar.tick();

      async.setImmediate(function() {
        callback(null, linkCheckResult);
      });

      return;
    }

    if(dryRun) {
      const linkCheckResult = {};

      linkCheckResult.link = link;
      linkCheckResult.statusCode = 0;
      linkCheckResult.status = 'ignored';

      if(showProgressBar)
        bar.tick();

      async.setImmediate(function() {
        callback(null, linkCheckResult);
      });

      return;
    }

    if (ignorePatterns) {
      let shouldIgnore = ignorePatterns.some(function(ignorePattern) {
        return ignorePattern.pattern instanceof RegExp ? ignorePattern.pattern.test(link) : (new RegExp(ignorePattern.pattern)).test(link) ? true : false;
      });
    
      if (shouldIgnore) {
        const linkCheckResult = {};

        linkCheckResult.link = link;
        linkCheckResult.statusCode = 0;
        linkCheckResult.status = 'ignored';

      if(showProgressBar)
        bar.tick();

        callback(null, linkCheckResult);
        return;
      }
    }
      
    linkCheck(link, {}, function (err, result) {
      if (showProgressBar) {
          bar.tick();
      }
      callback(err, result);
    });
  });

}

module.exports = asciidocAwareLinkCheck;
