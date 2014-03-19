 var fs = require( "fs" ),
	path = require( "path" ),
	shasum = require( "shasum" );

module.exports = CarteroNodeHook;

function CarteroNodeHook( options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( options );

	if( options === undefined || options.assetsDir === undefined || options.viewDir === undefined )
		throw new Error( "assetsDir and viewDir options are both required" );

	this.viewDir = options.viewDir;
	this.assetsDir = options.assetsDir;
	this.assetsBaseUrl = options.assetsBaseUrl || '/';

	try {
		this.viewMap = require( path.join( this.assetsDir, "view_map.json" ) );
	}
	catch( err ) {
		throw new Error( "Error while reading the view_map.json file. Have you run cartero yet?" + err.stack );
	}

	this.assetsMap = {};
}

CarteroNodeHook.prototype.getParcelId = function( viewPath ) {
	return this.viewMap[ shasum( path.relative( this.viewDir, viewPath ) ) ];
};

CarteroNodeHook.prototype.getAssetsJson = function( viewPath, cb ) {
	var _this = this;
	var parcelId = this.getParcelId( viewPath );

	if( this.assetsMap[ parcelId ] )
		cb( null, this.assetsMap[ parcelId ] );
	else {
		fs.readFile( path.join( this.assetsDir, parcelId, "assets.json" ), function( err, contents ) {
			if( err ) return callback( err );
			_this.assetsMap[ parcelId ] = JSON.parse( contents );
			cb( null, _this.assetsMap[ parcelId ] );
		} );
	}
};

CarteroNodeHook.prototype.getHtmlToLoadAssets = function( viewPath, cb ) {
	var _this = this;
	this.getAssetsJson( viewPath, function( err, assets ) {
		if( err )
			return cb( err );

		var result = {};

		result.js = assets.script.map( function( fileName ) {
			return "<script type='text/javascript' src='" + path.join( _this.assetsBaseUrl, fileName ) + "'></script>";
		} ).join( "" );

		result.css = assets.style.map( function( fileName ) {
			return "<link rel='stylesheet' href='" + path.join( _this.assetsBaseUrl, fileName ) + "'></link>";
		} ).join( "" );

		cb( null, result );
	} );
};