

//Make a Visualizer object, and a number of functions that operate on it.
// One of the functions accepts 
define(function(require, exports, module) {
var srcHolder = {};
var DisplayToSendTo = {};

var rootViewSet = {};

//var renderer = require('./renderPOPSyntaxGraph');


function init() {
	//access Visualizer values here, as a closure
	console.log("init visualizer");
}

/*
The way visualization works is that the Display has a particular window
 that it renders into, but the visualizer is kept isolated from the details.
 Rather, the visualizer keeps a visualization inside a carrier, which it
 then hands to the Display.  The Display then renders the visual elements
 that it gets out of the carrier.  
The window has particular dimensions, and a visualization needs to know
 them (or at the minimum the aspect ratio).  To communicate them, some
 protocol is used between Visualizer and Display.  The Visualizer then
 stores that info in the carrier, and it adds to the carrier a ViewSetLink
 for each visual island to be seen.  A visual island has a root
 view set, and the link to it contains the offset relative to the Display's
 window's origin, and it contains a scaling to apply to the link's child
 view set.
 k
  
 */
function setSrcHolder( srcHolderIn ) {
	srcHolder = srcHolderIn;
	rootViewSet = srcHolder.syntaxGraph.rootViewSet;
}

function connectToDisplay( POPDisplay ) {
	//access Visualizer values here, as a closure
	DisplayToSendTo = POPDisplay;
	console.log("connectToDisplay");
}


//Calling this function triggers a series of events:
//1) it generates a view hierarchy that represents the syntax graph
//2) it sends that view hierarchy to the Display
//3) the Display creates an internal representation of the hierarchy
//4) the Display paints that internal representation to some device
function visualizeNewSubGraph( newSubGraphRootElem ) {
	//access Visualizer values here, as a closure
	console.log("visualizeNewSubGraph");

    //Once developed, this is where the visualizer will calculate the
    // positions and scales inside the view set links, and will fill in any
    // newly needed view boxes.  For example when a new elem is added, then
    // the visualizer has to create the view tree for it.
    //When get to adding that functionality, may turn out that need to have
    // side band comm between modifier and visualizer.. for example, when a
    // "drag elem" command happens, then the only mod is a change to the view
    // graph..  so have the modifier talk to the visualizer directly, passing
    // along the change to the view.

    //for now, just set the view root to be the view set attached to the elem
    //Note: this is NOT the right behavior..  the root view set is often the
    //      view set that is above the root element..  if the root elem's view
    //      set is subordinate to any, then the one it is subordinate to should
    //      be the root view set (I think.. have to see in practice).
    rootViewSet = newSubGraphRootElem.viewSet;

    console.log("Visualizer -- new root view set ID: " + rootViewSet.ID );
	
	//for now, just send reference to the viewHierarchy -- make this 
	// sane later (not sure whether will do a "class" and create 
	// instance via new operator, or what..)
	var rootTransforms = {
		realX: 0, //the root view set will have it's origin at 0,0 of window
		realY: 0,
		width: 800,
		height: 600,
		scaleFactor: 1.0
	};
	var rootWindow = {};
	rootWindow.children = [];
	rootWindow.children.push( {	rootViewSet: rootViewSet, 
								transforms:  rootTransforms } );
	
	DisplayToSendTo.renderWindow( rootWindow );
	
	return;
}

return{
	init: init,
	setSrcHolder: setSrcHolder,
	connectToDisplay: connectToDisplay,
	updateViewSubGraph: visualizeNewSubGraph
};
});


