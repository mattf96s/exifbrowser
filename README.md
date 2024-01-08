# exifbrowser.com

A local-first file explorer making use of the new Origin Private File System (OPFS) and web workers.

Drop a folder of 1000+ images onto the page and it will generate a list of all the images and their EXIF data in a couple of seconds.

Demo coming soon (after work).

This is the base for a custom [iNaturalist](https://www.inaturalist.org/) upload interface.

_Very much a work in progress._

https://github.com/mattf96s/exifbrowser/assets/68327846/b9727bc5-1954-434a-89c1-03575cc11eeb

## Tech Stack

- Remix (React)
- SST (AWS CDK)
- Comlink (Web Workers)
- IndexedDB

### Notable Web API's

- OPFS (Origin Private File System)
- File System Access API
- Web Workers

### Notable design patterns

- @tanstack/virtual (virtualized list)
- On-the-fly image compression using a web worker before rendering in the browser (single biggest perf gain).

## Development

TODO

## TODO List

### Features

- File tree directory navigation instead of a flat list. Would allow for separate sessions based off the directory.
- Experiment with different perf patterns (queues, better caching with IndexedDB + cache API, cancelable promises, async iterators etc.)
- Image Editing
- Ability to add GPS data to images with a GPX (or similar) file.
- Tests
- Run certain transformations in parallel depending on the number of cores available.

### Refactors / Improvements

- Cleanup + consistent code style
- Responsive design
- Browser support

### Deployment

- Deployment pipeline with SEED
- Add privacy-focused analytics/error tracking (avoid session recordings etc.)

### Documentation

- Add to this README

### Misc

- Add a license
- Add a contributing guide
