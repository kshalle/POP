
//This is testing scaffolding..
define(function(require, exports, module) {
	
	//cause the source holder object to be made, which will in turn
	// cause a graph of syntax objects to be built inside of it
	// and also cause a visualizer object to be built inside of it
	var srcHolder = require('./GabePatternSrcHolder');
	
	/*
	Root view is an object that represents the window being used within the
	cycle -- the Display renders the view over its window, aso.  It
	 holds state about activity taking place in that window, such as 
	 insertion point, selection groups, camera point, direction, zoom,
	 and so on.
	This object is shared by all the elements involved with viewing and
	 editing, including the visualizer, display, commander, modifier, and
	 src holder.
	As of Sept 2014, it has an array of children, with one child for each
	 root view set that can be seen once the view is rendered into the 
	 window.  Each child is a view set link to that root view set.  The 
	 link holds offsets of the view set relative to the window origin, and
	 it holds the scale factor for the view set relative to the window.
	 */
	var rootView = {
		children: []
	};
	var tempViewSetLink = new ViewSetLink();
	tempViewSetLink.parentViewSet = rootView; //test for this in back-track
	tempViewSetLink.childViewSet = srcHolder.syntaxGraph.rootElem.rootViewSet;
	tempViewSetLink.xOffset = 0;
	tempViewSetLink.yOffset = 0;
	tempViewSetLink.scaleFactor = 1.0; //scale view set to its intrinsic size
	rootView.children.push(tempViewSetLink);
	
	srcHolder.addRootView( rootView );
	
	//get the Display object, which contains a function for passing a view
	// hierarchy, which the Display then paints onto the screen
	var POPDisplay = require('./POPDisplay');
	POPDisplay.setRootView( rootView );
	
	
	//back-link the visualizer, commander, and modifier
	//Note: can have multiple triplets, one for each kind of visualization
	// for example, these are for seeing graph form.. later will add a triple
	// for seeing the custom syntax form
	srcHolder.visualizer.setSrcHolder( srcHolder );
	srcHolder.commander.setSrcHolder(  srcHolder );
	srcHolder.modifier.setSrcHolder(   srcHolder );
	srcHolder.visualizer.setRootView( rootView );
	srcHolder.commander.setRootView(  rootView );
	srcHolder.modifier.setRootView(   rootView );
	
	//connect the pieces together
	//Not sure yet what final form this will take..  for now..
	srcHolder.visualizer.connectToDisplay( POPDisplay );
	POPDisplay.connectToCommander(			srcHolder.commander );
	srcHolder.commander.connectToModifier(	srcHolder.modifier );
	srcHolder.modifier.connectToSyntaxGraph(srcHolder.syntaxGraph );
	srcHolder.modifier.connectToVisualizer( srcHolder.visualizer );
	
	//run test on the modifier, which in turn sends a sub-graph to the
	// visualizer, which in turn sends the view hierarchy attached to the
	// graph to the Display, which converts the hierarchy a paintable form
	// and paints it.
	srcHolder.modifier.runTest( );	
	
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
