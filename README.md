cartero-node-hook
=================

Use this hook in combination with upcoming new version of [cartero](https://github.com/rotundasoftware/cartero) being developed on the [browserify branch](https://github.com/rotundasoftware/cartero/tree/browserify) to get the HTML to load the js and css assets needed for your parcel.

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
cnh.getHtmlToLoadAssets( viewPath, function( err, assetHtml ) {
  // assetHtml.js is a string of <script> tags
  // assetHtml.css is a string of <link> tags
} );
```

Using Express? Check out the upcoming new version of the [cartero-express-hook](https://github.com/rotundasoftware/cartero-express-hook) being developed on the [browserify branch](https://github.com/rotundasoftware/cartero-express-hook/tree/browserify). Its an express middleware wrapper around cartero-node-hook that injects the js and css html into the `res.locals` variables before render.

## API

###cnh = new CarteroNodeHook( opts );

Create a CarteroNodeHook instance.

`opts`:

```
{
  viewDirPath : "views",            // (required) path to your views directory.
                                    // same as viewDirPath passed to cartero.
  
  assetsDirPath : "static/assets",  // (required) path to where your cartero-generated assets are.
                                    // same as dstDir passed to cartero.

  assetsBaseUrl : "/"               // (optional) base url corresponding to the assets directory.
}
```

###cnh.getHtmlToLoadAssets( viewPath, cb )

Get the HTML to load the js and css assets for the view at viewPath. `cb` should have the following signature:

```javascript

function( err, assetHtml ) {
  console.log( assetHtml.js ); // a string of <script> tags
  console.log( assetHtml.css ); // a string of <link> tags
}
```
  
