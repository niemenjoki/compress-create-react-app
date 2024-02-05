[![npm version](https://img.shields.io/npm/v/compress-create-react-app.svg)](https://www.npmjs.com/package/compress-create-react-app)
[![npm monthly downloads](https://img.shields.io/npm/dm/compress-create-react-app.svg)](https://www.npmjs.com/package/compress-create-react-app)

Make your apps smaller by adding post build compression to your `create-react-app` build without configuration.

Compresses all html, css and javascript files in the build folder using brotli and gzip algorithms.

Feel free to create an issue for any problems you've had or if you want to request a new feature.

## Usage

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
    ".tff",
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

This is a small project that is currently maintained by one person. There are no strict contributing guidelines. If you're interested in contributing, see if there are any [issues](https://github.com/jnsjknn/compress-create-react-app/issues) you could help with or post a new one to suggest a feature.

## Buy Me A Coffee

<a href="https://www.buymeacoffee.com/jnsjknn" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## License

This app is licensed under the [Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE.md) license.
