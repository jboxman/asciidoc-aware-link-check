Why
====

I need to be able to validate external links that might be derived from attributes.

With this application, you can validate any `link` directive that references a URL with either an HTTP or HTTPS method.

Installation
====

To install the application, complete the following steps:

1. `npm i -g @jboxman/asciidoc-aware-link-check`

Usage
====

To learn about supported options, enter the following command:

```
$ asciidoc-aware-link-check --help
Usage: asciidoc-aware-link-check [options]

Options:
  -a, --attributes [attributes...]  Optional: Attributes such as "product-version=1".
  --csv                             Output to stdout in CSV format. Outputs BROKEN_LINK,MODULE,LINE_NUM. This option
                                    implies --no-progress and --quiet.
  -n, --dry                         Dry run.
  --no-progress                     Hide progress bar.
  -q, --quiet                       Display errors only.
  --stdin                           Read file list from stdin instead of a _topic_map.yml file. (default: false)
  --topic <path>                    Optional: Path to ascii_binder _topic_map.yml file.
  -h, --help                        display help for command
```

To validate links, enter the following command. Replace `<ASSEMBLY_FILE>` with the file name that includes any `include` statements needed to successfully build your documentation.

```
$ echo <ASSEMBLY_FILE> | asciidoc-aware-link-check --stdin
```

To validate links for your entire documentation set, you might enter the following the command. Replace `<ASSEMBLY_DIR>` with the directory where you save your assembly files.

```
$ find <ASSEMBLY_DIR> -type f -name '*.adoc' | asciidoc-aware-link-check --stdin
```

Known issues
====

* A `HTTP/1.1 301 Moved Permanently` is considered a broken link.
* Any links within a listing block are ignored.
* Not compatible with [Antora](https://antora.org/) for pages that include any partials

TODO
====

* Finish tests

Credits
====

This work is based on the [asciidoc-link-check](https://github.com/gaurav-nelson/asciidoc-link-check/) module.
