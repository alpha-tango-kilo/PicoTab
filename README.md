# Zendesk PicoTab

PicoTab aims to be a minimal successor to [Zendesk QuickTab](https://github.com/zendesklabs/QuickTab).
It aims to reproduce the important core functionality in a minimal and easily auditable codebase that's still maintained, allowing for easier corporate adoption.

## Technologies

* [Parcel](https://parceljs.org/) - for building and development
* [TypeScript](https://www.typescriptlang.org/) - safer and more self-explanatory code
* [WebExtension Polyfill](https://github.com/Lusito/webextension-polyfill-ts) - to be able to use Mozilla's `Promise`-based API in Chrome*

\* `Promise` APIs for `chrome` are only available with [version 3 manifests](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#feature-summary), which are incompatible with Parcel at this time ([Parcel tracking issue](https://github.com/parcel-bundler/parcel/issues/6079)).
In any case, polyfill improves cross-browser compatibility

## Permissions explanation

* `tabs` - to be able to view and manage active tabs
* `webNavigation` - to be able to intercept navigation to Zendesk links
* Access and change zendesk.com websites - to be able to open Zendesk's internal tabs

## Building

To build loose files:

```shell
git clone https://github.com/alpha-tango-kilo/PicoTab
cd PicoTab
npm install
npm run build
```

These can then be loaded as a loose file extension from `./build`, or if you want it zipped up for distribution/release, additionally run:

```shell
npm run ship
```

Which will create `release.zip` in the working directory
