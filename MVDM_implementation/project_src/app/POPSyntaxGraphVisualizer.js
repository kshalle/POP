

//Make a Visualizer object, and a number of functions that operate on it.
// One of the functions accepts 
define(function(require, exports, module) {
var srcHolder; var DisplayToSendTo; var rootView;

//var renderer = require('./renderPOPSyntaxGraph');


function init() {
	//access Visualizer values here, as a closure
	console.log("init visualizer");
}

/*
set src holder is called by the source holder at the point that a user
 indicates that they want a view.  The source holder creates a view object
 for that user, and creates a visualizer object for that window, and then
 calls this to pass the view object to the newly created visualizer.
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

The source holder keeps an object for each window that is open into the
 source holder's contents.
(Note that eventually a srcHolder will be a revisioned processor/timeline,
 which means that multiple copies of it will exist, each with variations in
 their evolution.  The POP system will handle sending updates between copies,
 sandboxing the copies, and giving viewers the ability to control updates
 from other copies and merges.  For example, viewers who tunnel in to a 
 given POP processor instance will do so via an authentication object, 
 which carries information on how to handle remote views.  According to 
 that, the srcHolder contents being view will likely be copied over, and
 separate editing can then take place remotely, with the copy having its
 own version of the timeline.  The authentication gives the policy on
 sending updates back to the home copy, vs making it a distributed holder,
 and policy on sandboxing ((so no updates go out or in)), and so on..)
So, remote views of a src holder have the window object inside the remote
 copy, and it likely isn't visible outside the remote POP instance (or
 if the POP instance is over distributed hardware, then the holder may be
 replicated or even divided among the hardware, so a given window may only
 be visible on one of the hardware boxes)

For now, there is a window object for each window that is open and viewing
 the srcHolder contents.
The srcHolder creates a separate visualizer object for each such window.
 That allows the visualizer to have state about the window, such as where
 the camera is located in space, the zoom factor, where the insertion point
 is within the graph for that user (who can have multiple windows, all
 seeing the same insertion point and same selection)
	
As of Sept 2014, this function is called by an artificial test setup that
 connects all the pieces: visualizer, src holder, display, commander,
 modifier..
 */
function setSrcHolder( srcHolderIn, _rootView ) {
	srcHolder = srcHolderIn;
	rootView = _rootView;
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
		
	DisplayToSendTo.renderView( rootView );
	
	return;
}

return{
	init: init,
	setSrcHolder: setSrcHolder,
	connectToDisplay: connectToDisplay,
	updateViewSubGraph: visualizeNewSubGraph
};
});


