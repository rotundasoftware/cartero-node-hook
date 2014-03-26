var test = require( 'tape' );
var CarteroNodeHook = require( "../" );
var path = require( "path" );

test( 'throw errors when required options are missing', function( t ) {
	t.plan( 3 );

	t.throws( function() {
		var hook = CarteroNodeHook();
	} );

	t.throws( function() {
		var hook = CarteroNodeHook( '' );
	} );

	t.throws( function() {
		var hook = CarteroNodeHook(
			path.join( __dirname, "example3/static/assets" )
		);
	} );
} );

test( 'example3', function( t ) {
	t.plan( 3 );
	var hook = new CarteroNodeHook(
		path.join( __dirname, "example3/views" ),
		path.join( __dirname, "example3/static/assets" ),
		{
			outputDirUrl : "/l"
		}
	);

	hook.getViewAssets( path.join( __dirname, 'example3/views/page1/page1.jade' ), { paths : false }, function( err, result ) {
		t.deepEqual( result, {
			script : [ '/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js' ],
			style : [ '/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css' ] }
		);
	} );

	hook.getViewAssets( path.join( __dirname, 'example3/views/page1/page1.jade' ), { paths : true }, function( err, result ) {
		t.deepEqual( result, {
			script : [ 'b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js' ],
			style : [ 'b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css' ] }
		);
	} );

	hook.getViewAssetHTMLTags( path.join( __dirname, 'example3/views/page1/page1.jade' ), function( err, result ) {
		t.deepEqual( result, {
			script : '<script type=\'text/javascript\' src=\'/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js\'></script>',
			style : '<link rel=\'stylesheet\' href=\'/l/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css\'></link>' }
		);
	} );
} );

test( 'example3 (no baseUrl)', function( t ) {

	t.plan( 2 );
	var hook = new CarteroNodeHook(
		path.join( __dirname, "example3/views" ),
		path.join( __dirname, "example3/static/assets" )
	);

	hook.getViewAssets( path.join( __dirname, 'example3/views/page1/page1.jade' ), {}, function( err, result ) {
		t.deepEqual( result, {
			script : [ '/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js' ],
			style : [ '/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css' ] }
		);
	} );

	hook.getViewAssetHTMLTags( path.join( __dirname, 'example3/views/page1/page1.jade' ), function( err, result ) {
		t.deepEqual( result, {
			script : '<script type=\'text/javascript\' src=\'/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_14d030e0e64ea9a1fced71e9da118cb29caa6676.js\'></script>',
			style : '<link rel=\'stylesheet\' href=\'/b4ca7610c2ace13dc8d4c9f96eb62b459fcfceca/page1_bundle_da3d062d2f431a76824e044a5f153520dad4c697.css\'></link>' }
		);
	} );
} );