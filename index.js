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

CarteroNodeHook.prototype.getUrlsToLoadAssets = function( viewPath, cb ) {
	var _this = this;
	this.getAssetsJson( viewPath, function( err, assets ) {
		if( err )
			return cb( err );

		var result = {};

		result.js = assets.script.map( function( fileName ) {
			return path.join( _this.assetsBaseUrl, fileName );
		} );

		result.css = assets.style.map( function( fileName ) {
			return path.join( _this.assetsBaseUrl, fileName );
		} );

		cb( null, result );
	} );
};

CarteroNodeHook.prototype.getHtmlToLoadAssets = function( viewPath, cb ) {
	this.getUrlsToLoadAssets( viewPath, function( err, assetUrls ) {
		if( err )
			return cb( err );

		var result = {};

		result.js = assetUrls.js.map( function( url ) {
			return "<script type='text/javascript' src='" + url + "'></script>";
		} ).join( "" );

		result.css = assetUrls.css.map( function( url ) {
			return "<link rel='stylesheet' href='" + url + "'></link>";
		} ).join( "" );

		cb( null, result );
	} );
};