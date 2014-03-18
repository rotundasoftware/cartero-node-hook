var test = require( 'tape' );
var carteroNodeHook = require( "../" );
var path = require( "path" );

test( 'throw errors when required options are missing', function( t ) {
	t.plan( 5 );

	t.throws( function() {
		var hook = carteroNodeHook();
	} );

	t.throws( function() {
		var hook = carteroNodeHook( {} );
	} );

	t.throws( function() {
		var hook = carteroNodeHook( {
			assetsDir : path.join( __dirname, "example3/static/assets" ),
		} );
	} );

	t.throws( function() {
		var hook = carteroNodeHook( {
			viewDir : path.join( __dirname, "example3/views" ),
		} );
	} );

	t.throws( function() {
		var hook = carteroNodeHook( {
			viewDir : path.join( __dirname, "example3/views" ),
		} );
	} );
} );

test( 'example3', function( t ) {
	t.plan( 1 );
	var hook = carteroNodeHook( {
		assetsDir : path.join( __dirname, "example3/static/assets" ),
		viewDir : path.join( __dirname, "example3/views" ),
		assetsBaseUrl : "/l"
	} );

	hook.getAssetsForView( path.join( __dirname, 'example3/views/page1/page1.jade' ), function( err, result ) {
		t.deepEqual( result, {
			js : '<script type=\'text/javascript\' src=\'/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js\'></script>',
			css : '<link rel=\'stylesheet\' href=\'/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css\'></link>' }
		);
	} );
} );

test( 'example3 (no baseUrl)', function( t ) {

	t.plan( 1 );
	var hook = carteroNodeHook( {
		assetsDir : path.join( __dirname, "example3/static/assets" ),
		viewDir : path.join( __dirname, "example3/views" )
	} );

	hook.getAssetsForView( path.join( __dirname, 'example3/views/page1/page1.jade' ), function( err, result ) {
		t.deepEqual( result, {
			js : '<script type=\'text/javascript\' src=\'/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js\'></script>',
			css : '<link rel=\'stylesheet\' href=\'/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css\'></link>' }
		);
	} );
} );




