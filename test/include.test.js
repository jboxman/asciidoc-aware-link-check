import { describe } from 'riteway';

const path = require('path');
const asciidoctor = require(`asciidoctor`)();

const includeProcessor = require('../lib/asciidoc/asciidoc-include-processor');

describe('asciidoctor include preprocessor', async assert => {
  const assemblyFile = path.join(path.dirname(__filename), 'fixtures', 'adoc', 'main.adoc');
  const registry = asciidoctor.Extensions.create();

  includeProcessor(registry, path.dirname(__filename));

  const asciidocOptions = {
    doctype: 'book',
    safe: 'unsafe',
    sourcemap: true,
    base_dir: path.dirname(assemblyFile),
    extension_registry: registry
  }

  const doc = asciidoctor.loadFile(assemblyFile, asciidocOptions);
  doc.convert();

});
