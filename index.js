var fs = require( "fs" );
var path = require( "path" );
var shasum = require( "shasum" );
var pathMapper = require( "path-mapper" );
var _ = require( "underscore" );

var kMetaDataFileName = "metaData.json";
var kOldPackageMapName = "package_map.json";

module.exports = CarteroNodeHook;

function CarteroNodeHook( outputDirPath, options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( outputDirPath, options );

	if( outputDirPath === undefined )
		throw new Error( "outputDirPath is required" );

	options = _.defaults( {}, options, {
		rootApplicationDir : undefined,
		outputDirUrl : '/',
		cache : true
	} );

	this.rootApplicationDir = options.rootApplicationDir;
	this.outputDirPath = path.resolve( path.dirname( require.main.filename ), outputDirPath );
	this.outputDirUrl = options.outputDirUrl;
	this.cache = options.cache;

	try {
		this.metaData = require( path.join( this.outputDirPath, kMetaDataFileName ) );
	}
	catch( err ) {
		if( fs.existsSync( path.join( this.outputDirPath, kOldPackageMapName ) ) )
			throw new Error( 'Error while reading ' + kMetaDataFileName + ' file from ' + outputDirPath + '. It looks like your assets were compiled with an old version of cartero incompatible with this cartero hook.\n' + err );

		throw new Error( 'Error while reading ' + kMetaDataFileName + ' file from ' + outputDirPath + '. (Have you run cartero yet?)\n' + err );
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
	// view map uses relative paths so the app can change locations in the directory
	// structure between build and run time without breaking the mapping.
	
	var parcelId = this.metaData.packageMap[ _this.getPackageMapKeyFromPath( parcelSrcPath ) ];
	if( ! parcelId ) return cb( new Error( 'Could not find parcel with absolute path "' + parcelSrcPath + '"' ) );

	if( _this.cache && this.parcelAssetsCache[ parcelId ] )
		cb( null, this.parcelAssetsCache[ parcelId ] );
	else {
		fs.readFile( path.join( this.outputDirPath, parcelId, "assets.json" ), function( err, contents ) {
			if( err ) return cb( err );

			var parcelAssets = JSON.parse( contents );

			if( _this.cache )
				_this.parcelAssetsCache[ parcelId ] = parcelAssets;

			cb( null, parcelAssets );
		} );
	}
};

CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
	var _this = this;

	var url = pathMapper( assetSrcAbsPath, function( srcDir ) {
		srcDir = _this.getPackageMapKeyFromPath( srcDir );
		return _this.metaData.packageMap[ srcDir ] ? '/' + _this.metaData.packageMap[ srcDir ] : null; // return val of dstDir needs to be absolute path
	} );

	if( url === assetSrcAbsPath )
		throw new Error( 'Could not find url for that asset.' );

	if( _this.outputDirUrl )
		url = path.join( _this.outputDirUrl, url );

	return url;
};

CarteroNodeHook.prototype.getPackageMapKeyFromPath = function( packagePath ) {
	if( this.rootApplicationDir ) return './' + path.relative( this.rootApplicationDir, packagePath );
	else return packagePath;
};