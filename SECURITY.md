# Security policy

## Supported versions

No versions of `compress-create-react-app` receive security updates. Version
1.4.6 is the final planned release, and the package is deprecated.

Existing installations remain available from npm, but users should migrate
away from Create React App and use compression provided by their current build
tool, server, or hosting platform.

The `retainUncompressedFiles: false` option permanently deletes selected
original build files. Keep the default value of `true` unless deletion is
required and the build output can be reproduced.
