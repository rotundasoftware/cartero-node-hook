 var fs = require( "fs" ),
	path = require( "path" ),
	shasum = require( "shasum" );

module.exports = CarteroNodeHook;

function CarteroNodeHook( options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( options );

	if( options === undefined || options.assetsDirPath === undefined || options.viewDirPath === undefined )
		throw new Error( "assetsDirPath and viewDirPath options are both required" );

	this.viewDirPath = options.viewDirPath;
	this.assetsDirPath = options.assetsDirPath;
	this.assetsBaseUrl = options.assetsBaseUrl || '/';

	try {
		this.viewMap = require( path.join( this.assetsDirPath, "view_map.json" ) );
	}
	catch( err ) {
		throw new Error( "Error while reading the view_map.json file. Have you run cartero yet?" + err.stack );
	}

	this.assetsMap = {};
}

CarteroNodeHook.prototype.getParcelId = function( viewPath ) {
	return this.viewMap[ shasum( path.relative( this.viewDirPath, viewPath ) ) ];
};

CarteroNodeHook.prototype.getAssetsJson = function( viewPath, cb ) {
	var _this = this;
	var parcelId = this.getParcelId( viewPath );

	if( this.assetsMap[ parcelId ] )
		cb( null, this.assetsMap[ parcelId ] );
	else {
		fs.readFile( path.join( this.assetsDirPath, parcelId, "assets.json" ), function( err, contents ) {
			if( err ) return callback( err );
			_this.assetsMap[ parcelId ] = JSON.parse( contents );
			cb( null, _this.assetsMap[ parcelId ] );
		} );
	}
};

CarteroNodeHook.prototype.getViewAssets = function( viewPath, options, cb ) {
	var _this = this;

	var outputUrls = options.urls === undefined ? true : options.urls;

	_this.getAssetsJson( viewPath, function( err, assets ) {
		if( err )
			return cb( err );

		var assetTypesToReturn = options.types || Object.keys( assets );

		var result = {};

		assetTypesToReturn.forEach( function( assetType ) {
			if( assets[ assetType ] ) {
				if( outputUrls ) {
					result[ assetType ] = assets[ assetType ].map( function( assetPath ) {
						return path.join( _this.assetsBaseUrl, assetPath );
					} );
				}
				else
					result[ assetType ] = assets[ assetType ];
			}
			else
				result[ assetType ] = [];
		} );

		return cb( null, result );
	} );
};

CarteroNodeHook.prototype.getViewAssetHTMLTags = function( viewPath, cb ) {
	this.getViewAssets( viewPath, { types : [ "style", "script" ], urls : true }, function( err, assetUrls ) {
		if( err )
			return cb( err );

		var result = {};

		result.script = assetUrls.script.map( function( url ) {
			return "<script type='text/javascript' src='" + url + "'></script>";
		} ).join( "" );

		result.style = assetUrls.style.map( function( url ) {
			return "<link rel='stylesheet' href='" + url + "'></link>";
		} ).join( "" );

		cb( null, result );
	} );
};