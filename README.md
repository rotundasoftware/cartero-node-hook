# cartero-node-hook

Simple Node.js run time library for [cartero](https://github.com/rotundasoftware/cartero).

[![build status](https://secure.travis-ci.org/rotundasoftware/cartero-node-hook.png)](http://travis-ci.org/rotundasoftware/cartero-node-hook)

## Installation
```
npm install cartero-node-hook
```

## Usage

```javascript
var hook = require( 'cartero-node-hook' );
var path = require( 'path' );

var h = hook( {
  viewDirPath : path.join( 'views' ),
  outputDirPath : path.join( 'static/assets' )
} );

// get the js and css html to inject into a server side view
h.getViewAssetHTMLTags( viewPath, function( err, tags ) {
  // tags.script is a string of <script> tags
  // tags.style is a string of <link> tags
} );
```

Using Express? [cartero-express-midddleware](https://github.com/rotundasoftware/cartero-express-middleware) automatically populates `res.locals` with the `script` and `link` tags for the view being rendered.

## API

### h = hook( viewDirPath, outputDirPath, options );

`viewDirPath` and `outputDirPath` are the absolute paths to your views directory and cartero output directory, respectively, as passed into cartero at build time. `options` may contain `outputDirPath`, which is base url corresponding to the cartero output directory relative to the domain root (default `'/'`).

### h.getParcelTags( parcelPath, cb )

Get the HTML tags to load the script and style assets for a parcel.


```javascript
h.getParcelTags( '~/my-app/views/page1', function( err, tags ) {
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

<!-- 

removed this method for now.. see index.js for details

### h.getAssetUrl( assetPath )

Returns the url of the asset with the absolute path `assetPath`. (Or more precisely, returns the url of the asset that was at that path at the time cartero was run.) An error is thrown if the supplied path does not correspond to an asset of any parcel.
-->

## Contributors

* [Oleg Seletsky](https://github.com/go-oleg)
* [David Beck](https://twitter.com/davegbeck)

## License

MIT