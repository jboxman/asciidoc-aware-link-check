const chalk = require('chalk');
const fsPath = require('path');
const asciidoctor = require(`asciidoctor`)();

const createUrlCatalog = require('./url-catalog');
const Converter = require('./asciidoc/asciidoc-converter');

function getLinks(inputPath, options = {}) {
  const urlCatalog = createUrlCatalog();

  // Captures external links defined in Asciidoc
  asciidoctor.ConverterFactory.register(new Converter(urlCatalog), ['html5']);

  // https://asciidoctor-docs.netlify.com/asciidoctor.js/processor/logging-api/
  const memoryLogger = asciidoctor.MemoryLogger.create();
  asciidoctor.LoggerManager.setLogger(memoryLogger)

  const asciidocOptions = {
    // parent.getSourceLocation() is undefined for a module, must use 'article'
    doctype: 'article',
    // asciidoctor: WARNING: include file is outside of jail; recovering automatically
    //safe: 'server',
    safe: 'unsafe',
    sourcemap: true
  }

  try {
    doc = asciidoctor.loadFile(inputPath, {
      ...asciidocOptions,
      attributes: { ...options.attributes },
      base_dir: fsPath.dirname(inputPath)
    });
  }
  catch(e) {
    console.error(e.message);
  }
  doc.convert();

  panicOnConversionError(inputPath, memoryLogger.getMessages());

  return urlCatalog;
}

/*
{
  "severity": "ERROR",
  "message": {
    "text": "include file not found: /modules/filesystems-and-storage/con_local-storage-options.adoc",
    "source_location": {
      "$$id": 1710,
      "file": "/Users/jasonb/Self/work/rhel-8-docs/enterprise/titles/configuring-and-maintaining/managing-storage-devices/assemblies/assembly_overview-of-available-storage-options.adoc",
      "dir": "/Users/jasonb/Self/work/rhel-8-docs/enterprise/titles/configuring-and-maintaining/managing-storage-devices/assemblies",
      "path": "assemblies/assembly_overview-of-available-storage-options.adoc",
      "lineno": 16
    }
  }
}
*/

// If error, panic
function panicOnConversionError(inputPath, messages) {
  for(const msg of messages) {
    if(msg.getSeverity() == 'ERROR') {
      //console.error(JSON.stringify(msg));
      console.error('[%s] asciidoctor encountered an error during parsing.', chalk.red('>'))
      console.error('[%s] This error must be resolved before links can be checked.', chalk.red('>'))
      console.error('[%s] File name: %s', chalk.red('>'), inputPath);
      console.error('[%s] "Error: %s"', chalk.red('>'), msg.getText());
      process.exitCode = 1;
      // This is no longer fatal because we might process many files at once.
      //throw new Error();
    }
  }
}

module.exports = getLinks;
