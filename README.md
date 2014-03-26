cartero-node-hook
=================

Run time library for the [Cartero](https://github.com/rotundasoftware/cartero) asset pipeline.

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

Using Express? The [cartero-express-hook](https://github.com/rotundasoftware/cartero-express-hook) is an express middleware wrapper for cartero-node-hook that injects the js and css html into the `res.locals` variables automatically before a view is rendered.

## API

### h = hook( viewDirPath, outputDirPath, options );

`viewDirPath` and `outputDirPath` are the absolute paths to your views directory and Cartero output directory, respectively, as passed into Cartero at build time. `options` may contain a `outputDirPath`, which is base url corresponding to the cartero output directory (default `'/'`).

### h.getViewAssetHTMLTags( viewPath, cb )

Get the HTML tags to load the script and style assets for the view at `viewPath`.

`cb` should have the following signature:

```javascript
h.getViewAssetHTMLTags( viewPath, function( err, tags ) {
  // tags.script is a string of <script> tags
  // tags.style is a string of <link> tags
} );
```

### h.getViewAssets( viewPath, options, cb )

Returns a hash of the assets for the view at `viewPath` keyed by asset type. `options` may contain:

  * `paths` - If truthy, asset paths are returned (relative to `outputDirPath`), instead of urls (prepended with `outputDirUrl`)
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