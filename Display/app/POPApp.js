
//This is testing scaffolding..
//As of July 2, 2014:
//instantiate a Display object
//instantiate a srcHolder object
//invoke the visualizer in the srcHolder object, passing it the Display object
//this should cause the visualizer to generate a view hierarchy and
// pass that to the Display, which then paints it
define(function(require, exports, module) {
	
	//get the Display object, which contains a function for passing a view
	// hierarchy, which the Display then paints onto the screen
	var POPDisplay = require('./POPDisplay');
	
	//invoke the module that paints a canned sub-piece of the gabe pattern
	// syntax graph.. just so have something to see! (for now.. remove later)
	require('./renderPOPSyntaxGraph');
	
	//cause the source holder object to be made, which will in turn
	// cause a graph of syntax objects to be built inside of it
	// and also cause a visualizer object to be built inside of it
	var srcHolder = require('./GabePatternSrcHolder');
	
	//connect the srcHolder to the Display
	//Not sure yet what final form this will take..  for now..
	srcHolder.visualizer.connectToDisplay( POPDisplay );
	
	//Trigger the visualizer to build a view hierarchy and pass that
	// to the Display object, which in turn triggers the Display to build
	// a famous render tree corresponding to the view hierarchy, which paints
	// the syntax graph representation into the browser
	//This isn't the correct final form of how the visualizer determines
	// the portions of the graph to generate a view hierarchy from, but
	// it works for now, while developing..
	srcHolder.visualizer.setViewSubGraph( srcHolder.visualizer.syntaxGraph );
	
	//Once the system is complete, the view will be initialized to whatever
	// the last view was before suspend.  When first built, the srcHolder
	// will be empty, so the view will have a null viewSubGraph.
	//As the MVDM loop gathers gestures, it will build up the syntax graph,
	// and during the process update the viewSubGraph.
	//Each gesture that modifies a portion of the graph that is currently
	// within the view will cause a change in the viewSubGraph..
	//Thinking perhaps just have markers inside the normal graph that delimit
	// the boundaries of the view sub-graph.  Implies that the view can only
	// include connected portions of the graph..  may be overly restrictive..
	// might have case where filter the kinds of things that are visible, 
	// which will collect disconnected pieces from the main graph.
});
