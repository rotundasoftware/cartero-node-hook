var test = require( 'tape' );
var CarteroNodeHook = require( "../" );
var path = require( "path" );

test( 'throw errors when required options are missing', function( t ) {
	t.plan( 1 );

	t.throws( function() {
		var hook = CarteroNodeHook();
	} );

} );

test( 'example3', function( t ) {
	t.plan( 3 );

	var hook = new CarteroNodeHook(
		path.join( __dirname, "example3/static/assets" ),
		{
			// outputDirUrl : "/l"
			outputDirUrl : "http://localhost/l"
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

		t.deepEqual( scriptTags, '<script type="text/javascript" src="http://localhost/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js"></script>' );
		t.deepEqual( styleTags, '<link rel="stylesheet" href="http://localhost/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css"></link>' );
	} );

} );