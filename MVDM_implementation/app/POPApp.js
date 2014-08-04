
//This is testing scaffolding..
define(function(require, exports, module) {
	
	//get the Display object, which contains a function for passing a view
	// hierarchy, which the Display then paints onto the screen
	var POPDisplay = require('./POPDisplay');
		
	//cause the source holder object to be made, which will in turn
	// cause a graph of syntax objects to be built inside of it
	// and also cause a visualizer object to be built inside of it
	var srcHolder = require('./GabePatternSrcHolder');
	
	//back-link the visualizer, commander, and modifier
	//Note: can have multiple triplets, one for each kind of visualization
	// for example, these are for seeing graph form.. later will add a triple
	// for seeing the custom syntax form
	srcHolder.visualizer.setSrcHolder( srcHolder );
	srcHolder.commander.setSrcHolder(  srcHolder );
	srcHolder.modifier.setSrcHolder(   srcHolder );
	
	//connect the pieces together
	//Not sure yet what final form this will take..  for now..
	srcHolder.visualizer.connectToDisplay( POPDisplay );
	POPDisplay.connectToCommander( srcHolder.commander );
	srcHolder.commander.connectToModifier( srcHolder.modifier );
	srcHolder.modifier.connectToSyntaxGraph( srcHolder.syntaxGraph );
	srcHolder.modifier.connectToVisualizer( srcHolder.visualizer );
	
	//run test on the modifier, which in turn sends a sub-graph to the
	// visualizer, which in turn sends the view hierarchy attached to the
	// graph to the Display, which converts the hierarchy into Famous
	// render tree, which causes it to paint.
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
