var fs = require( "fs" );
var path = require( "path" );
var shasum = require( "shasum" );
var pathMapper = require( "path-mapper" );
var _ = require( "underscore" );

var kParcelMapName = "parcel_map.json";
var kPackageMapName = "package_map.json";

module.exports = CarteroNodeHook;

function CarteroNodeHook( parcelsDirPath, outputDirPath, options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( parcelsDirPath, outputDirPath, options );

	if( outputDirPath === undefined || parcelsDirPath === undefined )
		throw new Error( "outputDirPath and parcelsDirPath options are both required" );

	options = _.defaults( {}, options, {
		outputDirUrl : '/'
	} );

	this.parcelsDirPath = path.resolve( path.dirname( require.main.filename ), parcelsDirPath );
	this.outputDirPath = path.resolve( path.dirname( require.main.filename ), outputDirPath );
	this.outputDirUrl = options.outputDirUrl;

	try {
		this.parcelMap = require( path.join( this.outputDirPath, kParcelMapName ) );
	}
	catch( err ) {
		throw new Error( 'Error while reading ' + kParcelMapName + ' file from ' + outputDirPath + '. (Have you run cartero yet?)\n' + err );
	}

	this.parcelAssetsCache = {};
}

CarteroNodeHook.prototype.getParcelTags = function( parcelSrcPath, cb ) {
	var _this = this;

	this.getParcelAssets( parcelSrcPath, function( err, assetUrls ) {
		if( err ) return cb( err );

		var scriptTags = assetUrls.script.map( function( assetPath ) {
			return "<script type='text/javascript' src='" + path.join( _this.outputDirUrl, assetPath ) + "'></script>";
		} ).join( '\n' );

		var styleTags = assetUrls.style.map( function( assetPath ) {
			return "<link rel='stylesheet' href='" + path.join( _this.outputDirUrl, assetPath ) + "'></link>";
		} ).join( '\n' );

		cb( null, scriptTags, styleTags );
	} );
};

CarteroNodeHook.prototype.getParcelAssets = function( parcelSrcPath, cb ) {
	var _this = this;

	// we need a relative path from the views dir, since that is how our map is stored.
	// view map uses relative pats so the app can change locations in the directory
	// structure between build and run time without breaking the mapping.
	parcelSrcPath = path.relative( this.parcelsDirPath, parcelSrcPath );

	var parcelId = this.parcelMap[ parcelSrcPath ];
	if( ! parcelId ) return cb( new Error( 'Could not find parcel with relative path "' + parcelSrcPath + '"' ) );

	if( this.parcelAssetsCache[ parcelId ] )
		cb( null, this.parcelAssetsCache[ parcelId ] );
	else {
		fs.readFile( path.join( this.outputDirPath, parcelId, "assets.json" ), function( err, contents ) {
			if( err ) return cb( err );

			_this.parcelAssetsCache[ parcelId ] = JSON.parse( contents );
			cb( null, _this.parcelAssetsCache[ parcelId ] );
		} );
	}
};

CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
	var _this = this;

	var packageMap = require( path.join( _this.outputDirPath, kPackageMapName ) );

	var url = pathMapper( assetSrcAbsPath, function( srcDir ) {
		srcDirShasum = shasum( srcDir );
		return packageMap[ srcDirShasum ] ? '/' + packageMap[ srcDirShasum ] : null; // return val of dstDir needs to be absolute path
	} );

	if( url === assetSrcAbsPath )
		throw new Error( 'Could not find url for that asset.' );

	if( _this.outputDirUrl )
		url = path.join( _this.outputDirUrl, url );

	return url;
};