

//Make a Visualizer object, and a number of functions that operate on it.
// One of the functions accepts 
define(function(require, exports, module) {
//Create the famous infrastructure, which is used for rendering on screen

var srcHolder = {};
var DisplayToSendTo = {};

var viewRoot = {};

//var renderer = require('./renderPOPSyntaxGraph');


function init() {
	//access Visualizer values here, as a closure
	console.log("init visualizer");
}

function setSrcHolder( srcHolderIn ) {
	srcHolder = srcHolderIn;
	viewRoot = srcHolder.syntaxGraph.rootViewSet;
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
function setViewSubGraph( syntaxSubGraph ) {
	//access Visualizer values here, as a closure
	console.log("setViewSubGraph");

	console.log("Visualizer -- view rootElem ID: " + viewRoot.ID + " second text: " + viewRoot.children[0].shape + " y: " + viewRoot.children[0].children[1].yOffset);
	
	//for now, just send reference to the viewHierarchy -- make this 
	// sane later (not sure whether will do a "class" and create 
	// instance via new operator, or what..
	DisplayToSendTo.acceptViewList( viewRoot );
	
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
	viewRoot.rootBox = {
		ID: gottenElem.ID,
		type:	'container',
		width: gottenElem.width,
		height: gottenElem.height,
		parent: null,
		children: []
	} //note, left out parent-relative position and shape!
	var currParent = viewRoot.rootBox;
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
	currParent = viewRoot.rootBox.children[1];
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
	console.log("Visualizer: " + viewRoot.children[0].children[2].shape + " y: " + viewRoot.children[0].children[2].yOffset);
	//for now, just send reference to the rootViewSet -- make this
	// sane later (not sure whether will do a "class" and create 
	// instance via new operator, or what..
	DisplayToSendTo.acceptViewList( viewRoot );
}

return{
	init: init,
	setSrcHolder: setSrcHolder,
	connectToDisplay: connectToDisplay,
	setViewSubGraph: setViewSubGraph
};
});


