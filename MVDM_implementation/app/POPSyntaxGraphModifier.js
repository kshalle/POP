

//Make a Commander object, consisting of the command functions.
//The Commander is given gestures detected by the Display, and turns them
// into commands and passes those along to the Modifier
define(function(require, exports, module) {
//Create the famous infrastructure, which is used for rendering on screen

var srcHolder       = {};
var syntaxGraphRoot = {};
var visualizer      = {};

var viewSubGraph    = {};

function init() {
	//access Visualizer values here, as a closure
	console.log("init modifier");
}

function setSrcHolder( srcHolderIn ) {
	srcHolder = srcHolderIn;
}

function connectToSyntaxGraph( syntaxGraphRootIn ) {
	//access values here, as a closure
	syntaxGraphRoot = syntaxGraphRootIn;
	console.log("connect modifier to Syntax Graph");
}
function connectToVisualizer( visualizerIn ) {
	//access values here, as a closure
	visualizer = visualizerIn;
	console.log("connect modifier to Visualizer");
}

function runTest( ){
	
//Trigger the visualizer to build a view hierarchy and pass that
// to the Display object, which in turn triggers the Display to build
// a famous render tree corresponding to the view hierarchy, which paints
// the syntax graph representation into the browser
visualizer.setViewSubGraph( syntaxGraphRoot.rootElem );
}

return{
	init:                 init,
	setSrcHolder:         setSrcHolder,
	connectToSyntaxGraph: connectToSyntaxGraph,
	connectToVisualizer:  connectToVisualizer,
	runTest:              runTest
};
});


