Why
====

I need to be able to validate external links that might be derived from attributes.

With this application, you can validate any `link` directive that references a URL with either an HTTP or HTTPS method.

Installation
====

To install the application, complete the following steps:

1. `git clone https://github.com/jboxman/asciidoc-aware-link-check.git`
1. `cd asciidoc-aware-link-check`
1. `npm install`
1. `npm link`

Eventually, I might try packaging this module and uploading it to the `npm` package repository.

Usage
====

To learn about supported options, enter the following command:

```
$ asciidoc-aware-link-check --help
Usage: asciidoc-aware-link-check [options] [assemblyFile]

Options:
  --no-progress  Show progress bar
  -q, --quiet    Display errors only
  --csv          Output in CSV format
  -n, --dry      Dry run
  -h, --help     output usage information
```

To validate links, enter the following command. Replace `<assembly-file>` with the file name that includes any `include` statements needed to successfully build your documentation.

```
$ asciidoc-aware-link-check <assembly-file>
```

To validate links for your entire documentation set, you might enter the following the command. Replace `<assembly-dir>` with the directory where you save your assembly files.

```
$ find <assembly-dir> -type f -name '*.adoc' | \
  xargs -L1 -I% -P1 asciidoc-aware-link-check %
```

Known issues
====

* A `HTTP/1.1 301 Moved Permanently` is considered a broken link.
* If you build your documentation using `ascii_binder`, it will automatically resolve included files relative to the root directory. This is not compatible with how Asciidoctor handles includes and will fail.

Credits
====

This work is based on the [asciidoc-link-check](https://github.com/gaurav-nelson/asciidoc-link-check/) module.
