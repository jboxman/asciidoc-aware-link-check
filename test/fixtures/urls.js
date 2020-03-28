const createUrlCatalog = require('../../lib/url-catalog');

function testWithUrls(urls = []) {
  return function testExtractor() {
    const catalog = createUrlCatalog();

    urls.forEach((url, idx) => {
      catalog.addUrl(
        url,
        {
          linkType: '<test>',
          linkText: 'test',
          sourceFile: __filename,
          sourceDirectory: __dirname,
          lineNumber: idx
        });
    });

    return catalog;
  }
}

const ignoreUrls = testWithUrls(
`
https://www.example.net/achiever.php?boundary=airport
http://birthday.example.org/bomb.html?acoustics=apparel&army=bite
https://www.example.org/beef/basketball.htm?appliance=boy&bead=belief
https://appliance.example.com/amount.html
https://bit.example.com/baseball.php
https://brass.example.com/
http://www.example.com/?air=baby&bead=airplane
http://www.example.com/book.html#airport
http://example.com/beds/argument
https://www.example.com/`.split('\n'));

module.exports = {
  ignoreUrls
};
