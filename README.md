Why
====

I need to be able to validate external links that might be derived from attributes.

With this application, you can validate any `link` directive that references a URL with either an HTTP or HTTPS method.

Installation
====

To install the application, complete the following steps:

1. `npm i -g asciidoc-aware-link-check`

Usage
====

To learn about supported options, enter the following command:

```
$ asciidoc-aware-link-check --help
Usage: asciidoc-aware-link-check [options] ASSEMBLY_FILE

Options:
  --no-progress  Hide progress bar.
  -q, --quiet    Display errors only.
  --csv          Output to stdout in CSV format. Outputs BROKEN_LINK,MODULE,LINE_NUM. This option implies --no-progress and --quiet.
  -n, --dry      Dry run.
  --asciibinder  Support asciibinder style include directives.
  -h, --help     output usage information
```

To validate links, enter the following command. Replace `<ASSEMBLY_FILE>` with the file name that includes any `include` statements needed to successfully build your documentation.

```
$ asciidoc-aware-link-check <ASSEMBLY_FILE>
```

To validate links for your entire documentation set, you might enter the following the command. Replace `<ASSEMBLY_DIR>` with the directory where you save your assembly files.

```
$ find <ASSEMBLY_DIR> -type f -name '*.adoc' | \
  xargs -L1 -I% -P1 asciidoc-aware-link-check %
```

Known issues
====

* A `HTTP/1.1 301 Moved Permanently` is considered a broken link.

TODO
====

* Finish tests

Credits
====

This work is based on the [asciidoc-link-check](https://github.com/gaurav-nelson/asciidoc-link-check/) module.
