var test = require( 'tape' );
var CarteroNodeHook = require( "../" );
var path = require( "path" );

test( 'throw errors when required options are missing', function( t ) {
	t.plan( 2 );

	t.throws( function() {
		var hook = CarteroNodeHook();
	} );

	t.throws( function() {
		var hook = CarteroNodeHook( '' );
	} );
} );

test( 'example3', function( t ) {
	t.plan( 3 );

	var hook = new CarteroNodeHook(
		path.join( __dirname, "example3/static/assets" ),
		{
			outputDirUrl : "/l"
		}
	);

	hook.getAssetsForEntryPoint( '/my/fake/abs/path/page1/page1.js', function( err, result ) {
		if( err ) throw err;

		t.deepEqual( result, {
			script : [ 'b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js' ],
			style : [ 'b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css' ] }
							 );
	} );

	hook.getTagsForEntryPoint( '/my/fake/abs/path/page1/page1.js', function( err, scriptTags, styleTags ) {
		if( err ) throw err;

		t.deepEqual( scriptTags, '<script type="text/javascript" src="/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js"></script>' );
		t.deepEqual( styleTags, '<link rel="stylesheet" href="/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css"></link>' );
	} );

} );

test( 'example3 (no baseUrl)', function( t ) {
	t.plan( 5 );

	var hook = new CarteroNodeHook(
		path.join( __dirname, "example3/static/assets" )
	);

	hook.getAssetsForEntryPoint( '/my/fake/abs/path/page2/page2.js', function( err, result ) {
		if( err ) throw err;

		t.deepEqual( result, {
			script : [ 'ea7138e6b6eea6321eb1926e8ac88d65f16aa51d/page2_bundle_5066f9594b8be17fd6360e23df52ffe750206020.js' ],
			style : [ 'ea7138e6b6eea6321eb1926e8ac88d65f16aa51d/page2_bundle_182694e4a327db0056cfead31f2396287b7d4544.css' ] }
							 );
	} );

	hook.getTagsForEntryPoint( '/my/fake/abs/path/page2/page2.js', function( err, scriptTags, styleTags ) {
		if( err ) throw err;

		t.deepEqual( scriptTags, '<script type="text/javascript" src="/ea7138e6b6eea6321eb1926e8ac88d65f16aa51d/page2_bundle_5066f9594b8be17fd6360e23df52ffe750206020.js"></script>' );
		t.deepEqual( styleTags, '<link rel="stylesheet" href="/ea7138e6b6eea6321eb1926e8ac88d65f16aa51d/page2_bundle_182694e4a327db0056cfead31f2396287b7d4544.css"></link>' );
	} );

	var asset = hook.getAssetUrl( '/my/fake/abs/path/page2/img/photo.png' );
	t.deepEqual( asset, '/ea7138e6b6eea6321eb1926e8ac88d65f16aa51d/img/photo_sha.png' );

	var nonexistentAsset = hook.getAssetUrl( '/my/fake/abs/path/page1/img/photo.png' );
	t.deepEqual( nonexistentAsset, undefined );
} );
