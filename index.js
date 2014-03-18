 var fs = require( "fs" ),
	path = require( "path" ),
	async = require( "async" ),
	shasum = require( "shasum" );

module.exports = function( options ) {
	if( options === undefined || options.assetsDir === undefined || options.viewDir === undefined )
		throw new Error( "assetsDir and viewDir options are both required" );

	var assetsDir = options.assetsDir;
	var viewDir = options.viewDir;
	var assetsBaseUrl = options.assetsBaseUrl || "/";
	var viewMap;
	var assetsMap = {};

	try {
		viewMap = require( path.join( assetsDir, "view_map.json" ) );
	}
	catch( err ) {
		throw new Error( "Error while reading the view_map.json file. Have you run the grunt cartero task yet?" + err.stack );
	}

	function getAssetsForView( viewPath, callback ) {
		var parcelId = viewMap[ shasum( path.relative( viewDir, viewPath ) ) ];

		async.waterfall( [
			function( callback ) {
				if( assetsMap[ parcelId ] )
					callback( null, assetsMap[ parcelId ] );
				else {
					fs.readFile( path.join( assetsDir, parcelId, "assets.json" ), function( err, contents ) {
						if( err ) return callback( err );
						assetsMap[ parcelId ] = JSON.parse( contents );
						callback( null, assetsMap[ parcelId ] );
					} );
				}
			}],
			function( err, assets ) {
				if( err )
					return callback( err );
				
				var result = {};

				result.js = assets.script.map( function( fileName ) {
					return "<script type='text/javascript' src='" + path.join( assetsBaseUrl, fileName ) + "'></script>";
				} ).join( "" );

				result.css = assets.style.map( function( fileName ) {
					return "<link rel='stylesheet' href='" + path.join( assetsBaseUrl, fileName ) + "'></link>";
				} ).join( "" );

				callback( null, result );
			}
		);
	}

	return {
		getAssetsForView : getAssetsForView
	};
};
