

//Make a SrcHolder object
define( function( require, exports, module ) {

	var visualizer  = require('./POPSyntaxGraphVisualizer');
	var commander   = require('./POPSyntaxGraphCommander');
	var modifier    = require('./POPSyntaxGraphModifier');	
	var syntaxGraph = require('./buildGabePatternSyntaxGraph');

	return{
		visualizer:  visualizer,
		commander:   commander,
		modifier:    modifier,
		syntaxGraph: syntaxGraph
	};
});


