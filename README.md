cartero-node-hook
=================

Use this hook in combination with upcoming new version of [cartero](https://github.com/rotundasoftware/cartero) being developed on the [browserify branch](https://github.com/rotundasoftware/cartero/tree/browserify) to get the HTML to load the js and css assets needed for your parcel.

[![build status](https://secure.travis-ci.org/rotundasoftware/cartero-node-hook.png)](http://travis-ci.org/rotundasoftware/cartero-node-hook)

## Install
`npm install cartero-node-hook`

## Usage

```javascript
var CarteroNodeHook = require( 'cartero-node-hook' );
var path = require( 'path' );

var cnh = new CarteroNodeHook( {
  viewDirPath : path.join( 'views' ),
  assetsDirPath : path.join( 'static/assets' )
} );

// when a request comes in, use the following snippet to get the js and css html to inject into the page
cnh.getViewAssetHTMLTags( viewPath, function( err, assetHTML ) {
  // assetHTML.script is a string of <script> tags
  // assetHTML.style is a string of <link> tags
} );
```

Using Express? Check out the upcoming new version of the [cartero-express-hook](https://github.com/rotundasoftware/cartero-express-hook) being developed on the [browserify branch](https://github.com/rotundasoftware/cartero-express-hook/tree/browserify). Its an express middleware wrapper around cartero-node-hook that injects the js and css html into the `res.locals` variables before render.

## API

###cnh = new CarteroNodeHook( opts );

Create a CarteroNodeHook instance.

`opts`:

```javascript
{
  viewDirPath : "views",            // (required) path to your views directory.
                                    // same as viewDirPath passed to cartero.
  
  assetsDirPath : "static/assets",  // (required) path to where your cartero-generated assets are.
                                    // same as dstDir passed to cartero.

  assetsBaseUrl : "/"               // (optional) base url corresponding to the assets directory.
}
```

###cnh.getViewAssetHTMLTags( viewPath, cb )

Get the HTML to load the script and style assets for the view at `viewPath`.

`cb` should have the following signature:

```javascript

function( err, assetHTML ) {
  console.log( assetHTML.script ); // a string of <script> tags
  console.log( assetHTML.style ); // a string of <link> tags
}
```

###cnh.getViewAssets( viewPath, opts, cb )

Get the assets by type for the view at `viewPath`.

`opts`:
```javascript
{
  urls : true,                    // (optional, default: `true`) whether the url to the asset
                                  // or the path relative to the `assetsDirPath` is returned.
                                  // defaults to true.
  
  types : [ 'script', 'style' ],  // (optional, defaults to all assets) the types of assets to return.

}
```

`cb` should have the following signature:

```javascript

function( err, assetHtml ) {
  console.log( assetHtml.script ); // array of url or path strings (ex: [ '/path/to/bundle.js' ])
  console.log( assetHtml.style ); // array of url or path strings (ex: [ '/path/to/bundle.css' ])
}
```
  
