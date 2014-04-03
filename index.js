var fs = require( "fs" );
var path = require( "path" );
var shasum = require( "shasum" );
var _ = require( "underscore" );

var kViewMapName = "view_map.json";
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
		this.viewMap = require( path.join( this.outputDirPath, kViewMapName ) );
	}
	catch( err ) {
		throw new Error( 'Error while reading the view_map.json file from ' + outputDirPath + '. Have you run cartero yet? ' + err );
	}

	this.assetsMap = {};
}

CarteroNodeHook.prototype.getViewAssets = function( viewPath, options, cb ) {
	var _this = this;

	options = _.defaults( {}, options, {
		paths : false
	} );

	_this._getAssetsJson( viewPath, function( err, assets ) {
		if( err ) return cb( err );

		var assetTypesToReturn = options.types || Object.keys( assets );

		var result = {};

		assetTypesToReturn.forEach( function( assetType ) {
			if( assets[ assetType ] ) {
				if( ! options.paths ) {
					result[ assetType ] = assets[ assetType ].map( function( assetPath ) {
						return path.join( _this.outputDirUrl, assetPath );
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
	this.getViewAssets( viewPath, { types : [ "style", "script" ] }, function( err, assetUrls ) {
		if( err ) return cb( err );

		var result = {};

		result.script = assetUrls.script.map( function( url ) {
			return "<script type='text/javascript' src='" + url + "'></script>";
		} ).join( '\n' );

		result.style = assetUrls.style.map( function( url ) {
			return "<link rel='stylesheet' href='" + url + "'></link>";
		} ).join( '\n' );

		cb( null, result );
	} );
};

CarteroNodeHook.prototype.getAssetUrl = function( assetSrcAbsPath ) {
	var _this = this;

	var packageMap = require( path.join( _this.outputDirPath, kViewMapName ) );

	var url = pathMapper( assetSrcAbsPath, function( srcDir ) {
		srcDirShasum = shasum( srcDir );
		return packageMap[ srcDirShasum ] ? '/' + packageMap[ srcDirShasum ] : null; // return val of dstDir needs to be absolute path
	} );

	if( url === assetSrcAbsPath )
		throw new Error( 'Could not find url for that asset.' );

	if( _this.outputDirUrl ) {
		var baseUrl = _this.outputDirUrl[0] === path.sep ? _this.outputDirUrl.slice(1) : _this.outputDirUrl;
		url = baseUrl + url;
	}

	return url;
};

CarteroNodeHook.prototype._getAssetsJson = function( viewPath, cb ) {
	var _this = this;
	var parcelId = this._getParcelId( viewPath );

	if( ! parcelId ) return cb( new Error( 'Could not find parcel for view "' + viewPath + '"' ) );

	if( this.assetsMap[ parcelId ] )
		cb( null, this.assetsMap[ parcelId ] );
	else {
		fs.readFile( path.join( this.outputDirPath, parcelId, "assets.json" ), function( err, contents ) {
			if( err ) return cb( err );

			_this.assetsMap[ parcelId ] = JSON.parse( contents );
			cb( null, _this.assetsMap[ parcelId ] );
		} );
	}
};

CarteroNodeHook.prototype._getParcelId = function( viewPath ) {
	return this.viewMap[ shasum( path.relative( this.viewsDirPath, viewPath ) ) ];
};