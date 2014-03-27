# cartero-node-hook

Node.js run time library for [Cartero](https://github.com/rotundasoftware/cartero).

[![build status](https://secure.travis-ci.org/rotundasoftware/cartero-node-hook.png)](http://travis-ci.org/rotundasoftware/cartero-node-hook)

## Install
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

Using Express? [cartero-express-midddleware](https://github.com/rotundasoftware/cartero-express-hook) automatically populates `res.locals` with the `script` and `link` tags for the view being rendered.

## API

### h = hook( viewDirPath, outputDirPath, options );

`viewDirPath` and `outputDirPath` are the absolute paths to your views directory and Cartero output directory, respectively, as passed into Cartero at build time. `options` may contain a `outputDirPath`, which is base url corresponding to the Cartero output directory (default `'/'`).

### h.getViewAssetHTMLTags( viewPath, cb )

Get the HTML tags to load the script and style assets for the view at `viewPath`.

```javascript
h.getViewAssetHTMLTags( viewPath, function( err, tags ) {
  // tags.script is a string of <script> tags
  // tags.style is a string of <link> tags
} );
```

### h.getViewAssets( viewPath, options, cb )

Returns a hash of asset urls keyed by asset type. `options` may contain:

  * `paths` - If true, asset paths are returned (relative to `outputDirPath`) insted of urls.
  * `types` - An array of assets types to return. If not supplied all asset types are returned.

```javascript
h.getViewAssets( viewPath, { [ 'style' ] }, function( err, assets ) {
  function( err, assets ) {
    console.log( assets.style );  // array of urls (ex: [ '/url/to/bundle.css' ])
  }
}
```

### h.getAssetUrl( assetPath )

Returns the url of the asset with the absolute path `assetPath`. (Or more precisely, returns the url of the asset that was at that path at the time Cartero was run.) An error is thrown if the supplied path does not correspond to an asset of any parcel.

## Contributors

* [Oleg Seletsky](https://github.com/go-oleg)
* [David Beck](https://twitter.com/davegbeck)

## License

MIT