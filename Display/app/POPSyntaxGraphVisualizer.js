

//Make a Visualizer object, and a number of functions that operate on it.
// One of the functions accepts 
define(function(require, exports, module) {
    //Create the famous infrastructure, which is used for rendering on screen
	
	var viewHierarchy = {};
	var DisplayToSendTo = {};
	
	var renderer = require('./renderPOPSyntaxGraph');	
	
	function init() {
		//access Visualizer values here, as a closure
		console.log("init visualizer");
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
		//for first pass, just build the view hierarchy by hand
		
		//A view hierarchy consists of a bounding boxes arranged in a
		// a hierarchy.  Inside each bounding box is either more bounding
		// boxes or a paintable thing.
		//For now, paintable things are either SVG or text
		//Text includes styles such as font, italics, size

		//In this test, just construct the hierarchy for the two boxes
		// that already did the by-hand SVG for, with the bezier connecting
		// them..  for now, just make the data structs and populate with
		// info gotten from the by-hand rendering
		//Later, will calculate all the box sizes and positions relative to
		// parents, starting from the syntax graph
		var gottenElem = renderer.getRootBox;
		viewHierarchy.rootBox = {
			ID: gottenElem.ID,
			type:	'container',
			width: gottenElem.width,
			height: gottenElem.height,
			parent: null,
			subBoxes: []
		} //note, left out parent-relative position and shape!
		var currParent = viewHierarchy.rootBox;
		var children = currParent.subBoxes;
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
			subBoxes: []
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
			subBoxes: []
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
			subBoxes: null
		}
		
		//now add the text to the elem box
		currParent = children[0];
		children = currParent.subBoxes; //set to subBoxes of elem box
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
			subBoxes: null
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
			subBoxes: null
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
			subBoxes: null
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
			subBoxes: null
		}
		
		//now add the text to the properties box
		currParent = viewHierarchy.rootBox.subBoxes[1];
		children = currParent.subBoxes;
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
			subBoxes: null
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
			subBoxes: null
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
			subBoxes: null
		}
		console.log("visual elem: " + viewHierarchy.rootBox.subBoxes[1].subBoxes[2].shape + " y: " + viewHierarchy.rootBox.subBoxes[1].subBoxes[2].yOffset);
		//for now, just send reference to the viewHierarchy -- make this 
		// sane later (not sure whether will do a "class" and create 
		// instance via new operator, or what..
		DisplayToSendTo.acceptViewList( viewHierarchy );
	}

	return{
		init: init,
		connectToDisplay: connectToDisplay,
		setViewSubGraph: setViewSubGraph
	};
});


