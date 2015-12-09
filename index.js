var fs = require( 'fs' );
var path = require( 'path' );
var shasum = require( 'shasum' );
var pathMapper = require( 'path-mapper' );
var _ = require( 'underscore' );

var url = require( 'url' );
var request = require( 'request' );

var kMetaDataFileName = 'metaData.json';
var kOldPackageMapName = 'package_map.json';

var kMetaDataFormatVersion = 3;

module.exports = CarteroNodeHook;

function CarteroNodeHook( outputDirUrl, options, cb ) {
	if( ! ( this instanceof CarteroNodeHook ) ) return new CarteroNodeHook( outputDirUrl, options );

	if( outputDirUrl === undefined )
	throw new Error( 'outputDirUrl is required' );

	// we need to make sure that the outputDirUrl is valid ( need to improve this check )
	if( outputDirUrl.search( /^(http(s?))\:\/\/[a-z0-9]/gi ) < 0 )
		throw new Error( 'outputDirUrl is now a valid URL' );


	options = _.defaults( {}, options, {
		appRootDir : '/',
		cache : true
	} );

	this.appRootDir = options.appRootDir;
	this.outputDirUrl = outputDirUrl;
	this.cache = options.cache;

	// normalize the outputDirUrl
	if( this.outputDirUrl.charAt( this.outputDirUrl.length - 1 ) !== '/' ) this.outputDirUrl += '/';

	this.parcelAssetsCache = {};
}

CarteroNodeHook.prototype.getTagsForEntryPoint = function( entryPointPath, cb ) {
	var _this = this;

	this.getAssetsForEntryPoint( entryPointPath, function( err, assetUrls ) {
		if( err ) {
			console.log( err );
			return cb( err );
		}

		var scriptTags = assetUrls.script.map( function( assetPath ) {
			// var srcUrl = ( _this.useCDN ) ? url.resolve( _this.outputDirUrl, assetPath ) : path.join( _this.outputDirUrl, assetPath )
			return '<script type="text/javascript" src="' + url.resolve( _this.outputDirUrl, assetPath ) + '"></script>';
		} ).join( '\n' );

		var styleTags = assetUrls.style.map( function( assetPath ) {
			// var srcUrl = ( _this.useCDN ) ? url.resolve( _this.outputDirUrl, assetPath ) : path.join( _this.outputDirUrl, assetPath )
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

	this.setupMetaData( function( err ) {
		if( err ) return cb( err );

		var parcelId = _this.metaData.entryPointMap[ _this.getPackageMapKeyFromPath( entryPointPath ) ];
		if( ! parcelId ) return cb( new Error( 'Could not find assets for entry point with absolute path "' + entryPointPath + '"' ) );

		if( _this.cache && _this.parcelAssetsCache[ parcelId ] )
			cb( null, _this.parcelAssetsCache[ parcelId ] );
		else {
			var assetUrl = url.resolve( _this.outputDirUrl, parcelId + '/assets.json' );

			request.get( assetUrl, function( err, res, data ) {
				if( ! err && res.statusCode === 200 ) {
					try {
						parcelAssets = JSON.parse( data );
					}
					catch( err ) {
						return cb( err )
					}

					if( _this.cache )
						_this.parcelAssetsCache[ parcelId ] = parcelAssets;

					return cb( null, parcelAssets );
				}

				return cb( new Error( "Could not get file from " + assetUrl ) );
			} );
		}
	} );
};

CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
	var _this = this;

	if( ! this.metaData ) {
		throw new Error( 'Cartero meta data file could not be read. Please make sure to call first hook.setupMetaData' );
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

CarteroNodeHook.prototype.getMetaData = function( cb ) {
	var _this = this;
	var metaData;

	var metaDataUrl = url.resolve( _this.outputDirUrl, kMetaDataFileName );
	request.get( metaDataUrl, function( err, res, data ) {
		if( ! err && res.statusCode === 200 ) {
			try {
				metaData = JSON.parse( data );
			}
			catch( err ) {
				if( _this.cache )
					return cb( new Error( 'Error while reading ' + kMetaDataFileName + ' file from ' + _this.outputDirUrl + '. (Have you run cartero yet?)\n' + err ) );
				return cb( err )
			}

			if( metaData && metaData.formatVersion < kMetaDataFormatVersion ) {
				throw new Error( 'It looks like your assets were compiled with an old version of cartero incompatible with this cartero hook. Please update your version of cartero to the most recent release.' );
			}

			return cb( null, metaData );
		}

		return cb( new Error( 'Could not get ' + kMetaDataFileName + ' file from ' + _this.outputDirUrl ) );
	} );
};

CarteroNodeHook.prototype.initialize = function( cb ) {
	if( this.initialized ) return cb( null );
	this.initialized = true;

	return this.fetchMetadata( cb );
};

CarteroNodeHook.prototype.setupMetaData = function( cb ) {
	if( this.cache && this.metaData ) return cb( null );

	return this.fetchMetadata( cb );
};

CarteroNodeHook.prototype.fetchMetadata = function( cb ) {
	var _this = this;

	this.getMetaData( function( err, metaData ) {
		if( err ) return cb( err );
		_this.metaData = metaData;
		return cb( null );
	} );
};