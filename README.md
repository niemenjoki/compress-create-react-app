# compress-create-react-app

> [!WARNING]
> `compress-create-react-app` is deprecated and no longer maintained. Version
> 1.4.6 is the final planned release. Existing installations remain available,
> but new projects should not adopt this package. Create React App is also
> [deprecated](https://react.dev/blog/2025/02/14/sunsetting-create-react-app).

[![npm version](https://img.shields.io/npm/v/compress-create-react-app.svg)](https://www.npmjs.com/package/compress-create-react-app)
[![npm monthly downloads](https://img.shields.io/npm/dm/compress-create-react-app.svg)](https://www.npmjs.com/package/compress-create-react-app)

Add post-build Brotli and gzip compression to an existing Create React App
build with minimal configuration.

By default, the CLI compresses HTML, CSS, and JavaScript files in the build
directory while retaining the original files.

## Migration

Existing projects can continue using the final release while they migrate away
from Create React App. For current React recommendations, see
[Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app).

After migrating, use compression provided by the current build tool, server, or
hosting platform. Verify how the deployment serves `.br` and `.gz` files before
removing this CLI; many hosting platforms already compress responses without
pre-generated files.

## Existing project usage

##### 0) Create your app using create-react-app

#### 1) Installation

Install the package as a dev dependency:

```bash
npm install compress-create-react-app --save-dev
```

#### 2) Usage

Edit your app's build script in `package.json`:

```diff
  "scripts": {
    "start": "react-scripts start",
-   "build": "react-scripts build",
+   "build": "react-scripts build && compress-cra",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
```

###### Custom build directory

You can provide an optional path to your build directory by adding `-d` or `--directory` argument to the command in your `package.json`:

```bash
...
"build": "react-scripts build && compress-cra -d /path/to/build",
...
```

The default build path is `/build`. The provided custom path should be a relative path from your project's **root directory**.

###### Custom configuration

You can create an optional configuration file `compress-cra.json`:

```json
{
  "algorithms": ["br", "gz"],
  "filetypes": [
    ".html",
    ".js",
    ".css",
    ".svg",
    ".png",
    ".jpg",
    ".mp3",
    ".wav",
    ".ttf",
    ".woff2",
    ".map"
  ],
  "directory": "/build"
}
```

The default config values are as follows:

```json
{
  "filetypes": [".js", ".html", ".css"],
  "directory": "/build",
  "algorithms": ["br", "gz"],
  "retainUncompressedFiles": true,
  "asynchronousCompression": true
}
```

By default, compress-cra looks for `compress-cra.json` in the project root but you may also provide a custom path to the config file by adding `-c` or `--config` argument to the command in your `package.json`:

```bash
...
"build": "react-scripts build && compress-cra -c /path/to/configfile",
...
```

Compress-cra retains the original uncompressed files by default. If you want them to be deleted automatically, you can set `retainUncompressedFiles` to false in your `compress-cra.json` file:

```json
{
  "filetypes": [".js", ".html", ".css"],
  "directory": "/build",
  "algorithms": ["br", "gz"],
  "retainUncompressedFiles": false
}
```

Deletion is permanent. In version 1.4.6, the build directory must be inside
the project root, cannot be the project root itself or a symbolic link, and at
least one supported compression algorithm must be configured. Nested symbolic
link directories are not traversed.

Compress-cra compresses files asynchronously by default. This makes the compression faster but won't work with too many files or if your system doesn't have enough memory available. You can use synchronous compression by setting `asynchronousCompression` to false in your `compress-cra.json` file:

```json
{
  "filetypes": [".js", ".html", ".css"],
  "directory": "/build",
  "algorithms": ["br", "gz"],
  "asynchronousCompression": false
}
```

#### 3) Build your app just like you normally would

```bash
npm run build
```

#### 4) Make your server serve the compressed files

The way to set up your server highly depends on the server you use.

Some useful tools to set up your server:

- [express-static-gzip](https://www.npmjs.com/package/express-static-gzip) for `express` servers
- [CompressedStaticFiles](https://github.com/AnderssonPeter/CompressedStaticFiles) for `asp.net core` servers

## Contributing

This package is deprecated, and no new features or maintenance releases are
planned after version 1.4.6. The repository remains available as a public
record for existing users.

## Buy Me A Coffee

<a href="https://www.buymeacoffee.com/niemenjoki" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## License

This software is licensed under the [MIT License](LICENSE).
