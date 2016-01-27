var fs = require( 'fs' );
var path = require( 'path' );
var shasum = require( 'shasum' );
var _ = require( 'underscore' );

var url = require( 'url' );

var kMetaDataFileName = 'metaData.json';
var kOldPackageMapName = 'package_map.json';

var kMetaDataFormatVersion = 4;

module.exports = CarteroNodeHook;

function CarteroNodeHook( outputDirPathOrMetaData, options ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( outputDirPathOrMetaData, options );

	if( outputDirPathOrMetaData === undefined )
		throw new Error( 'outputDirPathOrMetaData is required' );

	options = _.defaults( {}, options, {
		appRootDir : '/',
		outputDirUrl : '/',
		cache : true
	} );

	// we need to make sure that the outputDirUrl is valid
	if( options.outputDirUrl.search( /^(http(s?))\:\/\/[a-z0-9]/gi ) < 0 )
		throw new Error( 'outputDirUrl is now a valid URL' );

	this.metaDataProvidedAsArgument = ( _.isObject( outputDirPathOrMetaData ) ) ? true : false;
	this.outputDirPath = ( ! this.metaDataProvidedAsArgument ) ? path.resolve( path.dirname( require.main.filename ), outputDirPathOrMetaData ) : null;
	this.metaData = ( ! this.metaDataProvidedAsArgument ) ? this.getMetaData() : outputDirPathOrMetaData;

	this.appRootDir = options.appRootDir;
	// this.outputDirPath = path.resolve( path.dirname( require.main.filename ), outputDirPath );
	this.outputDirUrl = options.outputDirUrl;
	this.cache = options.cache;

	// this.metaData = this.getMetaData();
	this.parcelAssetsCache = {};

	// normalize the outputDirUrl
	if( this.outputDirUrl.charAt( this.outputDirUrl.length - 1 ) !== '/' ) this.outputDirUrl += '/';
}

CarteroNodeHook.prototype.getTagsForEntryPoint = function( entryPointPath, cb ) {
	var _this = this;

	this.getAssetsForEntryPoint( entryPointPath, function( err, assetUrls ) {
		if( err ) return cb( err );

		var scriptTags = assetUrls.script.map( function( assetPath ) {
			return '<script type="text/javascript" src="' + url.resolve( _this.outputDirUrl, assetPath ) + '"></script>';
		} ).join( '\n' );

		var styleTags = assetUrls.style.map( function( assetPath ) {
			return '<link rel="stylesheet" href="' + url.resolve( _this.outputDirUrl, assetPath ) + '"></link>';
		} ).join( '\n' );

		cb( null, scriptTags, styleTags );
	} );
};

CarteroNodeHook.prototype.getAssetsForEntryPoint = function( entryPointPath, cb ) {
	//TODO perhaps impl so entryPointPath can be dir OR path (that may end in an ext such as .js)?
	//if using packageMap instead of entryPoint (with option to be dir or entryPoint):
	//if (path.extname(entryPointPath)) entryPointPath = path.dirname(entryPointPath); //test for an extension
	//var parcelId = this.metaData.packageMap[ _this.getPackageMapKeyFromPath( entryPointPath ) ];
	var _this = this;

	if( ! _this.cache ) {
		if ( ! this.metaDataProvidedAsArgument ) this.metaData = this.getMetaData();
		else console.warn( 'You ask me to refresh the metaData but you provide as argument, please check your config.');
	}

	if( ! this.metaData ) {
		return cb( new Error( 'Cartero meta data file could not be read.' ) );
	}

	// var entryPointAssets = this.metaData.entryPoints[ entryPointPath ];
	var entryPointAssets = this.metaData.assetsRequiredByEntryPoint[ _this.getPackageMapKeyFromPath( entryPointPath ) ];
	if( ! entryPointAssets ) return cb( new Error( 'Could not find assets for entry point with absolute path "' + entryPointPath + '"' ) );

	// if metaDataProvidedAsArgument don't use cache
	if( this.metaDataProvidedAsArgument ) return cb( null, entryPointAssets );

	if( _this.cache && this.parcelAssetsCache[ entryPointPath ] )
		cb( null, this.parcelAssetsCache[ entryPointPath ] );
	else {
		if( _this.cache )
			_this.parcelAssetsCache[ entryPointPath ] = entryPointAssets;

		cb( null, entryPointAssets );
	}
};

CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
	var _this = this;

	if( ! this.metaData ) {
		throw new Error( 'Cartero meta data file could not be read.' );
	}

	var assetPathRelativeToAppDir = path.relative( this.appRootDir, assetSrcAbsPath );

	if( ! this.metaData.assetMap[ assetPathRelativeToAppDir ] ) {
		throw new Error( 'Could not find url for asset "' +  assetSrcAbsPath + '" because no corresponding asset map entry was found.' );
	}

	var assetPathRelativeToOutputDir = this.metaData.assetMap[ assetPathRelativeToAppDir ];

	return url.resolve( _this.outputDirUrl, assetPathRelativeToOutputDir );
};

CarteroNodeHook.prototype.getPackageMapKeyFromPath = function( packagePath ) {
	return path.relative( this.appRootDir, packagePath );
};

CarteroNodeHook.prototype.getMetaData = function() {
	var _this = this;
	var metaData;

	try {
		var data = fs.readFileSync( path.join( this.outputDirPath, kMetaDataFileName ), 'utf8' );
		metaData = JSON.parse( data );
	} catch( err ) {
		if( fs.existsSync( path.join( this.outputDirPath, kOldPackageMapName ) ) )
			throw new Error( 'Error while reading ' + kMetaDataFileName + ' file from ' + this.outputDirPath + '. It looks like your assets were compiled with an old version of cartero incompatible with this cartero hook.\n' + err );

		if( _this.cache ) {
			throw new Error( 'Error while reading ' + kMetaDataFileName + ' file from ' + this.outputDirPath + '. (Have you run cartero yet?)\n' + err );
		} else {
			console.log( 'WARNING: Error while reading ' + kMetaDataFileName + ' file from ' + this.outputDirPath + '. (Have you run cartero yet?)\n' + err );
		}
	}

	if( metaData && metaData.formatVersion < kMetaDataFormatVersion ) {
		throw new Error( 'It looks like your assets were compiled with an old version of cartero incompatible with this cartero hook. Please update your version of cartero to the most recent release.' );
	}

	return metaData;
};
