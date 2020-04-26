const fs = require('fs');
const path = require('path');

// Include a file relative to docRoot to support asciibinder
module.exports = function includeProcessor(registry, docRoot) {
  registry.includeProcessor(function () {
    var self = this;

    self.handles(function (target) {
      return target.endsWith('.adoc');
    });

    self.process(function (doc, reader, target, attrs) {
      let content = '';

      try {
        content = fs.readFileSync(path.join(docRoot, target));
      }
      // TODO - implement exception handler
      catch(e) {}

      return reader.pushInclude(content.toString(), target, target, 1, attrs);
    });
  });
}
