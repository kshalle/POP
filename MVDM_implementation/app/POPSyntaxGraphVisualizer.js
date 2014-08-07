

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
	DisplayToSendTo.acceptRootViewSet( rootViewSet );
	
	return;
//===================================
	//for first pass, just build the view hierarchy by hand
	
	//A view hierarchy consists of bounding boxes arranged in a
	// a hierarchy.  Inside each bounding box is either more bounding
	// boxes or a paintable thing, or both.
	//For now, paintable things are all SVG, even text is SVG text

	//In this test, just construct the hierarchy for the two boxes
	// that already did the by-hand SVG for, with the bezier connecting
	// them..  for now, just make the data structs and populate with
	// info gotten from the by-hand rendering
	//Later, will calculate all the box sizes and positions relative to
	// parents, starting from the syntax graph
	var gottenElem = renderer.getRootBox;
	rootViewSet.rootBox = {
		ID: gottenElem.ID,
		type:	'container',
		width: gottenElem.width,
		height: gottenElem.height,
		parent: null,
		children: []
	} //note, left out parent-relative position and shape!
	var currParent = rootViewSet.rootBox;
	var children = currParent.children;
	//first child is the syntactic element box
	var gottenElem = renderer.getElemBox;
	children[0] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width, //match the SVG shapes inside
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: []
	}
	//second child is the properties box attached to the first box
	gottenElem = renderer.getPropertiesBox;
	children[1] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width, //match the SVG shapes inside
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: []
	}
	console.log("box2: " + children[1].shape);
	//third child is the bezier curve connecting the boxes
	gottenElem = renderer.getBezier;
	children[2] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	
	//now add the text to the elem box
	currParent = children[0];
	children = currParent.children; //set to children of elem box
	gottenElem = renderer.getText1_1_1;
	children[0] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	gottenElem = renderer.getText1_1_2;
	children[1] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	gottenElem = renderer.getText1_1_3;
	children[2] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	gottenElem = renderer.getText1_1_4;
	children[3] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	
	//now add the text to the properties box
	currParent = rootViewSet.rootBox.children[1];
	children = currParent.children;
	gottenElem = renderer.getText1_2_1;
	children[0] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	gottenElem = renderer.getText1_2_2;
	children[1] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	gottenElem = renderer.getText1_2_3;
	children[2] = {
		ID: gottenElem.ID,
		type:	'shape',
		width: gottenElem.width,
		height: gottenElem.height,
		xOffset: gottenElem.x,
		yOffset: gottenElem.y,
		shape: gottenElem.shape,
		parent: currParent,
		children: null
	}
	console.log("Visualizer: " + rootViewSet.children[0].children[2].shape + " y: " + rootViewSet.children[0].children[2].yOffset);
	//for now, just send reference to the rootViewSet -- make this
	// sane later (not sure whether will do a "class" and create 
	// instance via new operator, or what..
	DisplayToSendTo.acceptRootViewSet( rootViewSet );
}

return{
	init: init,
	setSrcHolder: setSrcHolder,
	connectToDisplay: connectToDisplay,
	setViewSubGraph: visualizeNewSubGraph
};
});


