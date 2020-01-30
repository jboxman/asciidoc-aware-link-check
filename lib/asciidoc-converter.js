const asciidoctor = require(`asciidoctor`)();

module.exports = class TemplateConverter {
  constructor(catalog) {
    this.baseConverter = asciidoctor.Html5Converter.$new();
    this._catalog = catalog;
  }

  convert(node, transform) {
    if(node.getNodeName() === "inline_anchor") {
      const { target, text, type } = node;

      if(type != 'link')
        return;

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
