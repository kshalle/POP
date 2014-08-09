

//Make a SrcHolder object
define( function( require, exports, module ) {

//bookkeeping, setup
var visualizer  = require('./POPSyntaxGraphVisualizer');
var commander   = require('./POPSyntaxGraphCommander');
var modifier    = require('./POPSyntaxGraphModifier');	
var syntaxGraph = require('./buildGabePatternSyntaxGraph');

var persistence = require('./persistence');

//persistence.clearPersistentGraph();
//persistence.persistTheGraph( syntaxGraph );
//console.log("\npersisting graph done!\n")

//wait until all the writes complete before retrieving!
syntaxGraph = persistence.retrieveTheGraph();
console.log("\nretrieving graph done!\n")

return{
	visualizer:  visualizer,
	commander:   commander,
	modifier:    modifier,
	syntaxGraph: syntaxGraph
};
});


