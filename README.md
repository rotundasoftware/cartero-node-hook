# cartero-node-hook

A hook for [cartero](https://github.com/rotundasoftware/cartero) implemented in Node.js.

[![build status](https://secure.travis-ci.org/rotundasoftware/cartero-node-hook.png)](http://travis-ci.org/rotundasoftware/cartero-node-hook)

## Installation
```
npm install cartero-node-hook
```

## Usage

```javascript
var hook = require( 'cartero-node-hook' );
var path = require( 'path' );

var h = hook( path.join( __dirname, 'static/assets' ) );

// get the js and css html of a parcel
h.getParcelTags( parcelPath, function( err, tags ) {
  // tags.script is a string of <script> tags
  // tags.style is a string of <link> tags
} );
```

Using Express? [cartero-express-midddleware](https://github.com/rotundasoftware/cartero-express-middleware) automatically populates `res.locals` with the `script` and `link` tags for the view being rendered.

## API

### h = hook( outputDirPath, options );

`outputDirPath` is the absolute path to your cartero output directory, as passed into cartero at build time. `options` may contain:

* `outputDirUrl` (default: `'/'` ) - the base url corresponding to the cartero output directory relative to the domain root.

* `cache` (default: `true`) - whether or not to cache meta data. Set to `false` in dev mode so that you don't need to restart your application when assets are changed.

### h.getParcelTags( parcelPath, cb )

Get the HTML tags to load the script and style assets for a parcel.

```javascript
h.getParcelTags( '/usr/rotunda/my-app/views/page1', function( err, tags ) {
	// tags.script is a string of <script> tags
	// tags.style is a string of <link> tags
} );
```

### h.getParcelAssets( parcelPath, cb )

Returns a hash of asset paths keyed by asset type. All paths are relative to the output directory.

```javascript
h.getParcelAssets( '/usr/rotunda/my-app/views/page2', function( err, assets ) {
	console.log( assets.style );  // array of paths (ex: [ 'url/to/bundle.css' ])
}
```

### h.getAssetUrl( assetPath )

Returns the url of the asset with the absolute path `assetPath`. (Or more precisely, returns the url of the asset that was at that path at the time cartero was run.) An error is thrown if the supplied path does not correspond to an asset of any parcel.

## Contributors

* [Oleg Seletsky](https://github.com/go-oleg)
* [David Beck](https://twitter.com/davegbeck)

## License

MIT

## Change log

### v1.0.0

* Removed `parcelDirPath` argument from initializer. (No longer needed since parcel paths are now stored in meta data as absolute paths.) Note this is an API change that will affect **all users**. Just get rid of the first argument to the intializer and you'll be good to go.
* `cacheParcelData` option changed to just `cache`
* Other assorted tweaks to work with new metaData.json file from cartero v3.0.0. You *must* use cartero >= v3.0.0 with this hook.

### v0.3.1

* First version in this change log.
>>>>>>> Stashed changes
