const fs = require('fs');
const path = require('path');

// Include a file relative to docRoot to support asciibinder
module.exports = function includeProcessor(registry, docRoot) {
  const refSeen = {};

  registry.includeProcessor(function () {
    var self = this;

    self.handles(function (target) {
      return target.endsWith('.adoc');
    });

    self.process(function (doc, reader, target, attrs) {
      let content = '';

      if(refSeen[target])
        return;

      try {
        content = fs.readFileSync(path.join(docRoot, target));
        content = content.toString();
        refSeen[target] = true;
      }
      // TODO - implement exception handler
      catch(e) {}

      if(content)
        return reader.pushInclude(content, target, target, 1, attrs);
 
      return;
    });
  });
}
