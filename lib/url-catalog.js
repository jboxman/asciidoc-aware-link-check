// TODO - A URL is not a unique key.
// TODO - if an attribute is found in a link, exit with an error.
// TODO - A URL may not be useful to check
//   /usr/share/doc/dovecot/wiki/SSL.DovecotConfiguration.txt
//  file:///usr/share/httpd/manual/mod/mod_ssl.html
//  mailto:maxamillion@fedoraproject.org
// ect.

function createUrlCatalog(options = {}) {
  const catalog = {};

  return {
    addUrl(url, obj) {
      catalog[url] = obj;
    },

    getUrl(url) {
      if(catalog[url])
        return catalog[url];

      return null;
    },

    getUrls() {
      return Object.keys(catalog);
    }
  }
}

module.exports = createUrlCatalog;
