cartero-node-hook
=================

Use this hook in combination with [cartero](https://github.com/rotundasoftware/cartero) to get the HTML to load the js and css assets needed for your parcel.

##API

###carteroNodeHook = new CarteroNodeHook( opts );

Create a CarteroNodeHook instance.

`opts`:

```
{
  viewDirPath : "views",            // (required) path to your views directory.
                                    // same as viewDirPath passed to cartero.
  
  assetsDirPath : "static/assets",  // (required) path to where your cartero-generated assets are.
                                    // same as dstDir passed to cartero.

  assetsBaseUrl : "/yourApp"        // (optional) string to prepend to the asset url
                                    // if your app isn't deployed at the root.
}
```

###carteroNodeHook.getHtmlToLoadAssets( viewPath, cb )

Get the HTML to load the js and css assets for the view at viewPath. `cb` should have the following signature:

```javascript

function( err, result ) {
  console.log( result.js ); // a string of <script> tags
  console.log( result.css ); // a string of <link> tags
}
```
  
