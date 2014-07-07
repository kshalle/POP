

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
	
	function acceptViewList (viewHierarchy) {
		//access Display object and its values here, as a closure
		console.log("POPDisplay: " + viewHierarchy.rootBox.subBoxes[1].subBoxes[2].shape + " y: " + viewHierarchy.rootBox.subBoxes[1].subBoxes[2].yOffset);
		//Here, convert each view hierarchy element into an equivalent
		// famous render tree node
	
	//the root node is always a container, no matter what, and it always
	// is placed at the user-view origin, no matter what
    var rootContainer = new ContainerSurface({
        size: [viewHierarchy.rootBox.width, viewHierarchy.rootBox.height], 
        properties: {
            overflow: 'hidden'
        }
    });
	mainContext.add(rootContainer);
	
	//Each node in the hierarchy will have a corresponding famous container
	// if the node has children.  The children will be offset relative to
	// the container's origin, and all will be transformed as a unit.
	// the node may also have a shape, in which case a surface with no
	// transform is added to the container.
	//While traversing the hierarchy, keep two queues of upcoming "parents"
	// one for parent containers, the other for the nodes that correspond
	// to those containers.  The container queue controls the loop "end"
	// condition..
	//Each time find a node that has children, push that node into a queue
	// and push the node's newly made container into a queue
	//When done with all current children, grab the oldest parent from the
	// queues.
	//
	//So, set up for these loops..
	var node = {}; var newSurface; var newSurfMod = {}; 
	var newContainer = {}; var newContMod = {}; 
	var i = 0; var numChildren = 0; 

	var nextGenParentContainers = []; var nextGenParentNodes = [];
	var parent = rootContainer; 
	nextGenParentNodes.push( viewHierarchy.rootBox);
	while( parent != undefined ) {
	children = nextGenParentNodes.shift().subBoxes;
	numChildren = children.length; 
	console.log("numChildren: "+numChildren);
	for( i=0; i < numChildren; i++) {
		node = children[i];
		console.log("nodeID: " + node.ID);
		//check whether node has children -- if so, create a container so
		// that all children transform together, and have same origin
		if(node.subBoxes != null) {
			newContainer = new ContainerSurface({
				size: [node.width, node.height], 
				properties: {
					overflow: 'hidden'
				}
			});
			newContMod = new StateModifier({
				transform: Transform.translate(node.xOffset, node.yOffset, 0)
			});
			parent.add( newContMod ).add( newContainer );
			//now check whether the node has a shape to render
			if(node.shape != null) {
				newSurface = new Surface({
				  size: [node.width, node.height],
				  content: node.shape
				});
				//no transform.. using transform applied to container
				newContainer.add( newSurface );
			}
			//now add to list of parents in next outer-loop
			nextGenParentContainers.push( newContainer );
			nextGenParentNodes.push( node );
		}
		//node has no children.. does it have a shape to render?
		if(node.shape != null) {
			newSurface = new Surface({
			  size: [node.width, node.height],
			  content: node.shape
			});
			//for this case, need a transform for the x and y offsets
			newSurfMod = new StateModifier({
				transform: Transform.translate(node.xOffset, node.yOffset, 0)
			});
			parent.add( newSurfMod ).add( newSurface );
		}
	}
	//finished all children of this node.. change parent
	parent = nextGenParentContainers.shift();
	}
	}
	
	function init() {
		console.log("init");
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


	return{
		init: init,
		handleGesture: handleGesture,
		acceptViewList: acceptViewList
	};
});


