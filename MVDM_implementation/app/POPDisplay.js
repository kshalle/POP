

//Make a Display object, and a number of functions that operate on it.
// One of the functions accepts an array of visual element objects as
// input, and turns those visual elements into a famous render tree.
//The famous context, and the surfaces, and so on exist inside the Display
// object.

//This uses require.js to create a module.  This module has the name of the
// file (POPDisplay).  Inside the define, a number of data structures and 
// functions are created, then returned at the end.  The returned things are
// what can be accessed by external functions that load this module, via
// themselves using the require("POPDisplay") call
define(function(require, exports, module) {
//Create the famous infrastructure, which is used for rendering on screen
var Engine           = require("famous/core/Engine");
var Surface          = require("famous/core/Surface");
var Modifier         = require("famous/core/Modifier");
var Transform 		 = require('famous/core/Transform');
var StateModifier 	 = require('famous/modifiers/StateModifier');
var ContainerSurface = require("famous/surfaces/ContainerSurface");
var EventHandler     = require('famous/core/EventHandler');

var commander = {}; //set by POPApp via a function (defined below) 

//make the context, which controls rendering to the screen
// once add something to this context, that add makes the thing visibly
// have effect.
//Note, these are available to the render function via the closure
// mechanism
var mainContext = Engine.createContext();

var handleGesture = function( event ) {
		//not sure this is the right form, but provide a handler for
		// gestures made by the programmer/user
		//This will make an object that pairs the gesture to the view
		// element that is represented by the surface(s) involved in
		// the gesture.
		//It will then send the object to the command generator, which 
		// is part of the source holder
	console.log("handleGesture");
}

function acceptViewList (viewRoot) {
	//Here, convert each view hierarchy element into an equivalent
	// famous render tree node
	
	//during testing, log some known positions within the hierarchy
	console.log("POPDisplay: " + viewRoot.children[0].shape + " y: " + viewRoot.children[0].children[2].yOffset);

	//the root node is always a container, no matter what, and it always
	// is placed at the user-view origin, no matter what
	var rootContainer = new ContainerSurface({
		//For now, fixed root size.. later, will set according to window
		// being displayed within..
		size: [viewRoot.width, viewRoot.height], 
		properties: {
			overflow: 'hidden'
		}
	});
	mainContext.add(rootContainer);

	//If a viewBox in the hierarchy has children, then make a famous
	// container that corresponds to it.
	//The children will be offset relative to
	// the container's origin, and all will be transformed as a unit.
	// The viewBox may also have a shape, in which case a surface with the
	// shape, but no transform, is added to the container.
	//While traversing the hierarchy, keep two queues of upcoming "parents"
	// one for parent containers, the other for the viewBoxs that correspond
	// to those containers.  The container queue controls the loop "end"
	// condition..
	//Each time find a viewBox that has children, push that viewBox into a queue
	// and push the viewBox's newly made container into a queue
	//When done with all current children, grab the oldest parent from the
	// queues.
	//
	//So, set up for these loops..
	var viewBox = {}; var newSurface = {}; var newSurfMod = {};
	var newContainer = {}; var newContMod = {}; 
	var i = 0; var numChildren = 0; 

	var nextGenParents = []; var parentContainer = {}; var viewBoxChildren = [];
	nextGenParents.push( {viewBox: viewRoot, container: rootContainer});
	//loop, getting oldest parent pair in queue each time
	while( (parentPair = nextGenParents.shift()) != undefined ) {
		parentContainer = parentPair.container;
		viewBoxChildren = parentPair.viewBox.children;
		numChildren = viewBoxChildren.length; 
		console.log("numChildren: " + numChildren);

		for( i=0; i < numChildren; i++) {
			viewBox = viewBoxChildren[i];
			console.log("viewBoxID: " + viewBox.ID);
			//check whether viewBox has children -- if so, create a 
			// container so that all children transform together, and
			// have same origin
			if(viewBox.children.length != 0) {
				newContainer = new ContainerSurface({
					size: [viewBox.width, viewBox.height], 
					properties: {
						overflow: 'hidden'
					}
				});
				newContMod = new StateModifier({
					transform: Transform.translate(viewBox.xOffset, viewBox.yOffset, 0)
				});
				//add child container and its transform to parent container
				parentContainer.add( newContMod ).add( newContainer );
				//now check whether the viewBox has a shape to render
				if(viewBox.shape != null) {
					newSurface = new Surface({
					  size: [viewBox.width, viewBox.height],
					  content: viewBox.shape
					});
					//no transform.. using transform applied to container
					newContainer.add( newSurface );
				}
				//now add to list of parents in next outer-loop
				nextGenParents.push( {viewBox: viewBox, container: newContainer} );
			}
			//Does viewBox have a shape to render?
			if(viewBox.shape != null) {
				newSurface = new Surface({
				  size: [viewBox.width, viewBox.height],
				  content: viewBox.shape
				});
				//for this case, need a transform for the x and y offsets
				newSurfMod = new StateModifier({
					transform: Transform.translate(viewBox.xOffset, viewBox.yOffset, 0)
				});
				parentContainer.add( newSurfMod ).add( newSurface );
			}
		}
		//finished all children of this viewBox.. loop to get new parent
	}
}

function init() {
	console.log("init");
    return;
	//	var POPStuffToDraw = 
	var mySurface = new Surface({
	  size: [100, 100],
	  content: '<svg width="100" height="80"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:black;stroke-width:3;opacity:0.5">',
	  properties: {
		color: 'white',
		lineHeight: '200%',
		textAlign: 'center',
		fontSize: '36px',
		cursor: 'pointer'
	  }
	});
	var stateModifier = new StateModifier({
		transform: Transform.translate(250, 100, 0)
	});
	mainContext.add(stateModifier).add(mySurface);
}

function connectToCommander( commanderIn ) {
	commander = commanderIn;
	console.log("display connect to commander");
}

return{
	init:               init,
	connectToCommander: connectToCommander,
	handleGesture:      handleGesture,
	acceptViewList:     acceptViewList
};
});


