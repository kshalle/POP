

//Make a SrcHolder object
define(function(require, exports, module) {

	var visualizer = require('./POPSyntaxGraphVisualizer');
	var syntaxGraph = require('./buildGabePatternSyntaxGraph');

	return{
		visualizer: visualizer,
		syntaxGraph: syntaxGraph
	};
});


