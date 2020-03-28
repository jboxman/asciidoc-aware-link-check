const asciidoctor = require(`asciidoctor`)();

module.exports = class TemplateConverter {
  constructor(catalog) {
    this.baseConverter = asciidoctor.Html5Converter.$new();
    this._catalog = catalog;
  }

  convert(node, transform) {
    if(node.getNodeName() === "inline_anchor") {
      let { target, text, type } = node;

      if(type != 'link')
        return;

      // FIXME - Handles: _link:++https://example.com++[text]_
      try {
        // U+0096	150	Start of Protected Area	SPA
        // U+0097	151	End of Protected Area	EPA
        if(/\u{96}\d\u{97}/u.test(target)) {
          for(const v of Object.values(node.parent.passthroughs[0])) {
            if(v['text'])
              target = v.text;
          }
        }
      }
      catch(e) {
        console.error(e);
        return this.baseConverter.convert(node, transform);
      }

      if(this._catalog.getUrl(target))
        return;

      this._catalog.addUrl(target, {
        linkType: type,
        linkText: text,
        sourceFile: node.parent.getSourceLocation().getFile(),
        sourceDirectory: node.parent.getSourceLocation().getDirectory(),
        lineNumber: node.parent.getLineNumber()
      });
    }

    return this.baseConverter.convert(node, transform);
  }
}
