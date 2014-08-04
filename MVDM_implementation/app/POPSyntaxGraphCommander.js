

//Make a Modifier object, consisting of the modifier functions in a closure.
//The Modifier is given commands from the Commander, and executes them, which
// modifies the syntax graph inside the holder.  The mods trigger update of
// the sub-graph to visualize.  The visualizer is told of the changes
define(function(require, exports, module) {
//Create the famous infrastructure, which is used for rendering on screen

var srcHolder = {};
var modifier = {};
	
function init() {
	//access Visualizer values here, as a closure
	console.log("init Commander");
}

function setSrcHolder( srcHolderIn ) {
	srcHolder = srcHolderIn;
}

function connectToModifier( modifierIn ) {
	//access Visualizer values here, as a closure
	modifier = modifierIn;
	console.log("connect commander to modifier");
}

return{
	init: init,
	setSrcHolder: setSrcHolder,
	connectToModifier: connectToModifier
};
});


