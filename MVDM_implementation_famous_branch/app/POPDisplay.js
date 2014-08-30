

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

//acceptRootViewSet is the main trigger..  it causes the Display to build
// a render tree out of the incoming view set.
//
//A view set is linked to other view sets.  Each link marks which is the parent
// and which is the child, and also carries an offset and scale, that are
// relative to the parent's root view box and are applied to the child's
// entire view tree.
//
//Do this: make a container for each view-set link.  The child view tree is
// added to that container.  Make two modifiers, one for the offset, the other
// for the scale, and add that chain to the parent container, then add the
// child container to the end of that chain:
// parentContainer.add(linksTranslateMod).add(linksScaleMod).add(childContainer)
//
//Separately add the view tree contents of parent to parent container
// and add contents of child view tree to child container..
//
//So, starting with root view set, assume that it is the top level view set,
// and so not the child of any others (not always true!  Fix later).
// Assume the view-set graph is formed such that a given view set is
// the child of at most one other view set.
// Make the root view set the "current view set"..  make a var that is the
// "end of current parent chain".  Set this var to be the main context.
//Start recursion..  this fn processes one view-set
// Mark the current (passed in as parameter) view set as "visited this round"
// Make a container, and add this container to the end of the parent chain
// (which was also passed in as a parameter).
//Add the root view box and its descendants to this container.
//Get view set's array of links.  For each view set link:
// check whether it's marked "do not pass" or the other side is marked
// "already visited this view set this round".
// if neither, then see whether the current view set is child or parent
// if parent, then create a modifier with the x and y offsets and a modifier
// with the scaling, all of which are stated in the link.  Add those modifiers
// to the current view set's container.  Then recursively call, with the last
// modifier as the "end of current parent chain" parameter and the child
// view set as the other parameter.  When return, go to next link.
// if child, then make the modifiers and add own container to end, then call
// a second recursive fn, which is nearly the same, except assumes enter it
// from a child, rather than enter it from a parent.  Place the first of
// the modifiers in the parameter position of "start of child mod chain" and
// the parent view set as the other parameter..
//
function acceptRootViewSet (rootViewSet) {
    //Here, convert view hierarchy into an equivalent famous render tree

    //during testing, log some known positions within the hierarchy
    console.log("POPDisplay: root view set: " + rootViewSet.ID);

    //First, check whether root view set is the top level view set (IE, one
    // with the outer-most bounding box that all the rest have to be scaled
    // and translated into.
//    for( all links ) {
//        if( rootViewSet is child ) {
//
//        }
//    }

    //Call the recursion with the root view set as the "current" view set
    // and the main context as the "end of current parent chain", which will
    // cause the recursion to add the view set's container to the main context.
    renderChildViewSet( rootViewSet, mainContext );
    rootViewSet.advanceToNextRound();
}

//Recursion..  this fn processes one view-set
// Mark the current (passed in as parameter) view set as "visited this round"
// Make a container for the view set, and add this container to the end of the
// parent chain (which was also passed in as a parameter).
//Add the tree of view boxes to this container.
//Get view set's array of links.  For each view set link:
// check whether it's marked "do not pass" or the other side is marked
// "already visited this view set this round".
// if neither, then see whether the current view set is child or parent
// if parent, then create a modifier with the x and y offsets and a modifier
// with the scaling, all of which are stated in the link.  Add those modifiers
// to the current view set's container.  Then recursively call, with the last
// modifier as the "end of current parent chain" parameter and the child
// view set as the other parameter.  When return, go to next link.
// if child, then make the modifiers and add own container to end, then call
// a second recursive fn, which is nearly the same, except assumes enter it
// from a child, rather than enter it from a parent.  Place the first of
// the modifiers in the parameter position of "start of child mod chain" and
// the parent view set as the other parameter..
function renderChildViewSet( viewSet, endOfParentChain ) {
    // Mark the current (passed in as parameter) view set as "visited this round"
    viewSet.makeProcessedTagCurrent(); //member fn of ViewSet class

    // Make a container for the view set, and add this container to the end of
    // the parent chain (which was also passed in as a parameter).
    var containerForSet = new ContainerSurface({
        size: [viewSet.width, viewSet.height],
        properties: {
            overflow: 'hidden'
        }
    });
    viewSet.container = containerForSet;
    endOfParentChain.add(containerForSet);

    //Add the set's tree of view boxes to this container.
    renderTheViewTreeOfViewSet(viewSet);

    //Get view set's array of links.
    var links = viewSet.viewSetLinks; var currLink; var shiftMod; var scaleMod;
    var newEnd;
    //For each view set link:
    for( var linkIdx = 0; linkIdx < links.length; linkIdx++ ) {
        // check whether it's marked "do not pass" or the other side is marked
        // "already visited this view set this round".  If so, skip this link.
        currLink = links[ linkIdx ];
        if( currLink.doNotPass() ) {
            continue; //go to next link!
        }

        //See whether the current view set is child or parent
        //TODO: test whether this check works!
        if( currLink.parentViewSet === viewSet ) {
            // if parent, then create a modifier with the x and y offsets and
            // a modifier with the scaling, all of which are stated in the
            // link.  Add those modifiers to the current view set's container.
            shiftMod = new StateModifier({
                transform: Transform.translate(currLink.xOffset, currLink.yOffset, 0)
            });
            scaleMod = new StateModifier({
                transform: Transform.scale(currLink.scale)
            });
            //all linked view sets get added as siblings within parent container
            newEnd = endOfParentChain.add(shiftMod).add(scaleMod);

            if( currLink.childViewSet.setWasProcessedThisRound() ) {
                newEnd.add( currLink.childViewSet.container )
            }
            else {
                // recursively call, with the last modifier as the "end of
                // current parent chain" parameter and the child view set as the
                // other parameter.
                renderChildViewSet( currLink.childViewSet, newEnd );
            }
        }
        else if( currLink.childViewSet === viewSet ) {
            // if child, then make the modifiers
            shiftMod = new StateModifier({
                transform: Transform.translate(currLink.xOffset, currLink.yOffset, 0)
            });
            scaleMod = new StateModifier({
                transform: Transform.scale(currLink.scale)
            });

            // then call a second recursive fn, which is nearly the same,
            // except assumes enter it from a child, rather than enter it from
            // a parent.  Give it the modifiers and the container for this set
            // as well as the parent view set.  It will create a container
            // for the parent set and add the modifiers and this sets container.
            if( currLink.parentViewSet.setWasProcessedThisRound() ) {
                currLink.parentViewSet.container.add(shiftMod).add(scaleMod).add(containerForSet);
            }
            else
                renderParentViewSet( currLink.childViewSet, shiftMod, scaleMod,
                                     containerForSet );
        }
        //This link done, go to next link..
    }
}

//contract: only call this if the parentViewSet has not been rendered yet this
// round!
function renderParentViewSet( parentViewSet, shiftChildMod, scaleChildMod, childViewSet ) {
    // Mark the current (passed in as parameter) view set as "visited this round"
    viewSet.makeProcessedTagCurrent(); //member fn of ViewSet class

    // Make a container for the view set, and add this container to the end of
    // the parent chain (which was also passed in as a parameter).
    var containerForSet = new ContainerSurface({
        size: [rootViewSet.rootViewBox.width, rootViewSet.rootViewBox.height],
        properties: {
            overflow: 'hidden'
        }
    });
    parentViewSet.container = containerForSet;
    containerForSet.add(shiftChildMod).add(scaleChildMod).add(childViewSet.container);

    //Add the set's tree of view boxes to its container.
    renderTheViewTreeOfViewSet(parentViewSet);

    //Get view set's array of links.
    var links = parentViewSet.viewSetLinks; var currLink; var shiftMod; var scaleMod;
    var newEnd;
    //For each view set link:
    for( var linkIdx = 0; linkIdx < links.length; linkIdx++ ) {
        // check whether it's marked "do not pass"
        currLink = links[ linkIdx ];
        if( currLink.doNotPass() ) {
            continue; //go to next link!
        }

        //See whether the current view set is child or parent
        //TODO: test whether this check works!
        if( currLink.parentViewSet === parentViewSet ) {
            if( currLink.childViewSet.setWasProcessedThisRound() &&
                currLink.childViewSet === childViewSet ) {
                continue; //already processed.. called from this child!
            }

            // is parent, so create a modifier with the x and y offsets and
            // a modifier with the scaling, all of which are stated in the
            // link.  Add those modifiers to the current view set's container.
            shiftMod = new StateModifier({
                transform: Transform.translate(currLink.xOffset, currLink.yOffset, 0)
            });
            scaleMod = new StateModifier({
                transform: Transform.scale(currLink.scale)
            });
            //all linked view sets get added as siblings within parent container
            newEnd = parentViewSet.container.add(shiftMod).add(scaleMod);

            if( currLink.childViewSet.setWasProcessedThisRound() ) {
                newEnd.add( currLink.childViewSet.container )
            }
            else {
                // recursively call, with the last modifier as the "end of
                // current parent chain" parameter and the child view set as the
                // other parameter.
                renderChildViewSet( currLink.childViewSet, newEnd );
            }
        }
        else if( currLink.childViewSet === parentViewSet ) {
            // current view set is the child on this link, so make the modifiers
            shiftMod = new StateModifier({
                transform: Transform.translate(currLink.xOffset, currLink.yOffset, 0)
            });
            scaleMod = new StateModifier({
                transform: Transform.scale(currLink.scale)
            });

            if( currLink.parentViewSet.setWasProcessedThisRound() ) {
                currLink.parentViewSet.container.add(shiftMod).add(scaleMod).add(containerForSet);
            }
            else
                renderParentViewSet( currLink.childViewSet, shiftMod, scaleMod,
                    containerForSet );
        }
        //This link done, go to next link..
    }
}

//set up rendering for one view tree from one view-set
function renderTheViewTreeOfViewSet( viewSet ) {
    var viewSetRootViewBox = viewSet.rootViewBox;
    var viewSetContainer = viewSet.container;

    //Descend the tree of view boxes breadth-first, making equivalent
    //Famo.us structures to render each.
	//If a viewBox in the hierarchy has children, then it needs a container
	// to hold its children view-box's surfaces or containers.  This container
    // is shifted by the viewBox's x and y offsets.
	//All the direct children will be offset relative to parent
	// container's origin, and all will be transformed as a unit.
	//The viewBox may have a shape.  If it also has children, then the shape
	// is added to the viewBox's container, with no offset.  Else, the shape
    // is shifted by it's x and y offset.
	//
	//While traversing the hierarchy, keep a queue of upcoming "parents"
	// where each parent is an obj that pairs a viewBox with its container.
	//Each time find a viewBox that has children, push that viewBox, with its
	// container into the queue.
	//When done with all current children, grab the oldest parent from the
	// queue.
	//
	//So, set up for the loop..  Render the root view box
	var newSurface = {}; var newSurfMod = {};
	var newContainer = {}; var newContMod = {}; 
	var i = 0; var numChildren = 0; 
	var nextGenParents = []; var parentContainer = {}; var viewBoxChildren = [];
    var rootViewBoxContainer = new ContainerSurface({
        size: [viewSetRootViewBox.width, viewSetRootViewBox.height],
        properties: {
            overflow: 'hidden'
        }
    });
    viewSetContainer.add(rootViewBoxContainer);
    viewSetRootViewBox.container = rootViewBoxContainer;
    if( viewSetRootViewBox.shape ) {
        newSurface = new Surface({
            size: [true, true], //let famous calculate the bounding box
            content: viewSetRootViewBox.shape
        });
        newSurface.correspondingViewBox = viewSetRootViewBox;
        if (viewSetRootViewBox.handlers.length > 0) {
            var handlers = viewSetRootViewBox.handlers;
            for (var i; i < handlers.length; i++) {
                newSurface.on('click', POPClickHandler);
            }
        }
        //no transform.. and shift or scale is applied to container
        rootViewBoxContainer.add(newSurface);
    }

    nextGenParents.push( {viewBox: viewSetRootViewBox, container: rootViewBoxContainer } );

	//loop, getting oldest parent pair in queue each time
	while( ( parentPair = nextGenParents.shift() ) != undefined ) {
		parentContainer = parentPair.container;
		viewBoxChildren = parentPair.viewBox.children;
		numChildren = viewBoxChildren.length; 
		console.log("Display Rendering: numChildren: " + numChildren);

		for( i=0; i < numChildren; i++) {
			currChildViewBox = viewBoxChildren[i];
			console.log("child viewBoxID: " + currChildViewBox.ID);
			//check whether child viewBox has itself children -- if so, create a
			// container so that all children transform together, and
			// have same origin
			if(currChildViewBox.children.length != 0) {
				newContainer = new ContainerSurface({
					size: [currChildViewBox.width, currChildViewBox.height],
					properties: {
						overflow: 'hidden'
					}
				});
				newContMod = new StateModifier({
					transform: Transform.translate(currChildViewBox.xOffset, currChildViewBox.yOffset, 0)
				});
				//add child's container and its transform to parent container
				parentContainer.add( newContMod ).add( newContainer );
				//now check whether the viewBox has a shape to render
				if(currChildViewBox.shape) {
					newSurface = new Surface({
					  size: [currChildViewBox.width, currChildViewBox.height],
					  content: currChildViewBox.shape
					});
                    newSurface.correspondingViewBox = currChildViewBox;
					//no transform.. using transform applied to container
                    if (currChildViewBox.handlers.length > 0) {
                        var handlers = currChildViewBox.handlers;
                        for (var h; h < handlers.length; h++) {
                            newSurface.on('keydown', POPClickHandler)
                        }
                    }
                    newContainer.add( newSurface );
				}
				//now add to list of parents in next outer-loop
				nextGenParents.push( {viewBox: currChildViewBox, container: newContainer} );
			}
			//Does viewBox have a shape to render?
			else if(currChildViewBox.shape) {
				newSurface = new Surface({
				  size: [currChildViewBox.width, currChildViewBox.height],
				  content: currChildViewBox.shape
				});
                newSurface.correspondingViewBox = currChildViewBox;
				//for this case, need a transform for the x and y offsets
				newSurfMod = new StateModifier({
					transform: Transform.translate(currChildViewBox.xOffset, currChildViewBox.yOffset, 0)
				});
                //add shape directly to parent container!
                if (currChildViewBox.handlers.length > 0) {
                    var handlers = currChildViewBox.handlers;
                    for (var h; h < handlers.length; h++) {
                        newSurface.on('keydown', POPClickHandler)
                    }
                }
                parentContainer.add( newSurfMod ).add( newSurface );
			}
		}
		//finished all children of this viewBox.. loop to get new parent
	}
}

function POPClickHandler(e) {
    console.log("event: " + e.type + " target: " +
        e.origin.correspondingViewBox.ID )
}

function prettyPrintObject(obj) { DumpObjectIndented, null }
function DumpObjectIndented(obj, indent)
{
    var result = "";
    if (indent == null) indent = "";

    for (var property in obj)
    {
        var value = obj[property];
        if (typeof value == 'string')
            value = "'" + value + "'";
        else if (typeof value == 'object')
        {
            if (value instanceof Array)
            {
                // Just let JS convert the Array to a string!
                value = "[ " + value + " ]";
            }
            else
            {
                // Recursive dump
                // (replace "  " by "\t" or something else if you prefer)
                var od = DumpObjectIndented(value, indent + "  ");
                // If you like { on the same line as the key
                //value = "{\n" + od + "\n" + indent + "}";
                // If you prefer { and } to be aligned
                value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
            }
        }
        result += indent + "'" + property + "' : " + value + ",\n";
    }
    return result.replace(/,\n$/, "");
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
    acceptRootViewSet:  acceptRootViewSet
};
});


