var fs = require( "fs" );
var path = require( "path" );
var shasum = require( "shasum" );
var _ = require( "underscore" );

var kParcelMapName = "parcel_map.json";
var kPackageMapName = "package_map.json";

module.exports = CarteroNodeHook;

function CarteroNodeHook( viewsDirPath, outputDirPath, options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( viewsDirPath, outputDirPath, options );

	if( outputDirPath === undefined || viewsDirPath === undefined )
		throw new Error( "outputDirPath and viewsDirPath options are both required" );

	options = _.defaults( {}, options, {
		outputDirUrl : '/'
	} );

	this.viewsDirPath = path.resolve( path.dirname( require.main.filename ), viewsDirPath );
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

		var result = {};

		result.script = assetUrls.script.map( function( assetPath ) {
			return "<script type='text/javascript' src='" + path.join( _this.outputDirUrl, assetPath ) + "'></script>";
		} ).join( '\n' );

		result.style = assetUrls.style.map( function( assetPath ) {
			return "<link rel='stylesheet' href='" + path.join( _this.outputDirUrl, assetPath ) + "'></link>";
		} ).join( '\n' );

		cb( null, result );
	} );
};

CarteroNodeHook.prototype.getParcelAssets = function( parcelSrcPath, cb ) {
	var _this = this;

	// we need a relative path from the views dir, since that is how our map is stored.
	// view map uses relative pats so the app can change locations in the directory
	// structure between build and run time without breaking the mapping.
	parcelSrcPath = path.relative( this.viewsDirPath, path.resolve( parcelSrcPath ) );

	var parcelId = this.parcelMap[ shasum( parcelSrcPath ) ];
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

// Taking this out for now. it works, but it requires that the app is located at the same place in the
// directory tree at build time as at run time. Seems like a bad requirement to be imposing by default.
// CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
// 	var _this = this;

// 	var packageMap = require( path.join( _this.outputDirPath, kPackageMapName ) );

// 	var url = pathMapper( assetSrcAbsPath, function( srcDir ) {
// 		srcDirShasum = shasum( srcDir );
// 		return packageMap[ srcDirShasum ] ? '/' + packageMap[ srcDirShasum ] : null; // return val of dstDir needs to be absolute path
// 	} );

// 	if( url === assetSrcAbsPath )
// 		throw new Error( 'Could not find url for that asset.' );

// 	if( _this.outputDirUrl )
// 		url = path.join( _this.outputDirUrl, url );

// 	return url;
// };