

/*
Make a Display object, and a number of functions that operate on it.
 One of the functions accepts an array of visual element objects as
 input, and turns those visual elements into a render tree.

So, from top level, can have case where zoom in and pan, and end up with
 pieces of syntax that have no direct relation to each other, and there
 is no path to navigate the graph from one portion to the other, without
 going up into nodes that are wholly outside the view window
Need something that represents the full, raw, browser window that this
 is all being rendered into.
So, pass in an object that repr the window, with a number of children, one
 child for each segment
When set up this window-object, find the most ancestral view set of each
 segment and make that one of the children of the window.

Q: possible to encounter case where navigate to a child via links, and 
 then that child has a second parent?  Or some other way end up with a 
 child, that has a link to a parent that hasn't been rendered yet?

Assumptions:
Assuming not possible for child to have an un-rendered parent, for now..
 (keep an eye towards making it straight forward to add that case later)
Assuming no forsest case for now, there's only one connected 
 sub-graph
Assuming caller finds an ancestor of whole sub-graph, whose bounding box
 visually contains all drawn shapes and all bounding boxes

Will eventually have to handle these cases in order to get zoom and pan
 to work!  (Just want to get basic functionality working, for now)
 */
define(function(require, exports, module) {

//===================  Class definitions  ==================
/*
A POP container is an organizing element used during rendering.
 It holds an absolute position on the screen, as well as an absolute
 size on the screen.  It inherits an accumaled scaling factor that
 is the product of all the scaling factors of its ancestors.
Hence, visual shapes can be stated in terms of their natural sizes,
 and then each one is given a local scale factor, only relative to a
 parent, within that parent's container.  So, the final absolute
 shape size, within the top-level window, is calculated by
 first applying the local scaling, to get it to the right size 
 within its parent container, and then applying the parent's
 accumulated scaling, to get it to the right size on the screen.
 */
function POPContainer() {
	//note, this doesn't need to be a class, as is, but expect
	// will add container-specific functions at some point
	// (as of sept 14)
    this.width  = 0;
	this.height = 0;
	this.realX  = 0;
	this.realY  = 0;
	this.imposedScaleFactor = 1.0;
	this.children = [];
}

//POPContainer.__proto__ = ?;
//POPContainer.prototype = ?;
POPContainer.prototype.constructor = POPContainer;


//========================  Event Handlers  ======================
/*
Generic Document wide key press event handler.
This first checks whether the key press is a Display handled thing (might 
 not actually be any.. was thinking perhaps pan or zoom be handled directly
 by the Display, or via Display-visualizer interaction, skipping commander
 and Modifier..)
 if not handled by Display, it checks which SVG the mouse is currently 
 innermost inside of, then gets the viewbox connected to that SVG, and 
 calls the key handler on that viewbox, if any.  If not, it moves outward,
 going up the viewbox hierarchy, until it finds a key handler.  Worst case
 is it gets all the way to the view set, which always has a key handler.
CONTRACT: all view sets have a key hander
*/
var keydownHdlr = function(e) {
   var msg = "event: " + e.type + ' keyCode=' + e.keyCode;
   msgEl.innerHTML = msg;
   console.log(msg);
   var viewBoxToHandleEvent = getBestShapeToHandleKeyDownEvent(e);
//   var svgElem = e.origin;
//   var viewBox = svgElem.correspondingViewBox;
   viewBoxToHandleEvent.handlers.keyDownHdlr; //BUG: handlers can be undef
};
document.addEventListener( "keydown", keydownHdlr, false );


/*
not sure this is the right form, but provide a handler for
 gestures made by the programmer/user
This will make an object that pairs the gesture to the view
 element that is represented by the surface(s) involved in
 the gesture.
It will then send the object to the command generator, which 
 is part of the source holder
 */
var handleGesture = function( e ) {
	console.log("handleGesture" + e.origin.correspondingViewBox.ID);
};


//========================  Global Vars  ========================
var commander = {}; //set by POPApp via a function (defined below) 

/*
The root svg element is in the html of the browser page, and all
 rendered shapes are appended directly to this root, as child svg
 elements.
 */
var __POPSVGRoot;

/*
Set up for rendering by getting the root SVG element from the HTML(Later
 will move this into a constructor or similar init, as may have
 multiple windows, for example.. will create Display object for each
 and have a dispatcher or something for directing visualizer render
 commands to the Display attached to appropriate (affected) window
*/ 
__POPSVGRoot = document.getElementById("svgRoot"); 

//=====================================================================
//=
//=					The Functions 
//=
//=====================================================================
/*
RenderWindow is the external call made on the Display that causes
 the Display to render the sub-graphs visible from the browser window,
 given the current zoom and pan settings.
	
NOTE: as of sept 10, 2014, this works by building a hierarchy of containers
 that hold other containers and shapes.  However, there is no direct 
 linkage between a container and its contained children.  The relationship
 is implied by passing them together as parameters.  Hence, the hierarchy
 is transient and recomputed every time the window is rendered!
 */
var renderWindow = function( window ){

	//for now (sept 2014), have only one sub-graph.
	//Each root view set has to be scaled and shifted to its position
	// within the window, so keep that info together with each child.
	//Note: this plumbing may change.. don't really want the visualizer
	// to have to calculate the position and scaling of each root view set
	//Render the root view set -- position and scale are inside transforms
	child = window.children[0];
	renderRootViewSet( child.rootViewSet, child.transforms );
		//now done with 
    child.rootViewSet.advanceTagsToNextRound();//marks all boxes as unvisited
}


/*
renderRootViewSet causes the Display to render all the view sets reachable,
 and treat them all as descendants contained
 inside the bounding box of the root view set. (Caller of this method
 must ensure that within all the view sets reachable from the root, that
 the root has the outer most bounding box.)

A view set is linked to other view sets.  Each link marks which is the parent
 and which is the child, and also carries the position and relative scaling
 applied to the child within the context of the parent.  The position assumes
 that the parent is the root, and the scaling is set such that the child
 container fits within the bounding box allocated to it within the parent.
Note that the parent view set is normally a syntactic-element that has a
 number of input-boxes around it.  Each of these input boxes has a size
 that is in absolute pixels, and a position.  The syntactic element also has
 a bounding box, which bounds the element's shape and all of the input
 boxes.  If that element's bounding box is drawn full size as the root of
 the display, then the input box is drawn with its stated size and 
 absolute position.
Now, the input box is normally not drawn (only drawn if it is empty). 
 Rather, that input is linked to a child view-set.  That entire view set
 is scaled such that its bounding box fits inside the input box, and the
 child view set's origin is shifted to the x, y position of the input box.
The link between the view sets carries the scaling factor and the x and y
 offset of child (x and y within the parent's bounding box, treating upper
 left of bounding box as 0,0)
Note that all rendering is done directly to the root SVG element.  Hence:
 -] when the child is drawn, it must first be scaled in the same way as the
  parent was scaled, and then scaled again by the amount in the link. Both
  these scalings are applied to the size of the child's bounding box.
 -] The real position of the child is the real position of the parent plus
  the offset of the child within the parent (carried in the link), but the 
  offset is only scaled by the scaling applied to the parent.  
 -] The child has its own children, who treat it as a parent.  The 
  grandchildren will see the child as a parent, and will use the scaling
  factor in the child.  That factor is the scaling factor in the parent
  multiplied by the scaling factor in the link. 

For Root View Set do this: 
-] Make a container for the view set, which acts as a root container.
- -] use the transforms passed along with root view set to shift and size it
- -] add container to the view set.
- -] The container width and height are scaled according to transforms 
- -] It's real x,y, and imposed scaling are calc'd according to transforms
-] Call the function that renders the view tree of a view set.
-] Call the recursive function that walks the view-set graph, visiting 
   the connected view-sets.

So, starting with root view set, assume that it is the top level view set,
 and so not the child of any others (not always true!  Fix later).
 Assume the view-set graph is formed such that a given view set is
 the child of at most one other view set.
Start recursion..  this fn processes one view-set
 Mark the current (passed in as parameter) view set as "visited this round"
 Make a container, and add this container to the end of the parent chain
*/
function renderRootViewSet (rootViewSet, transforms) {
	//For Root View Set do this: 
	//-] Make a container for it, which acts as a root container.
	//- -] The container width and height scaled according to transforms
	//- -] It's real x,y and imposed scaling are given in the transforms
	//-] Call the function that renders the view tree of a view set.
	//-] Call the recursive function that walks the view-set graph, visiting 
	//   the connected view-sets.
	var rootContainer = new POPContainer();
	rootContainer.width = rootViewSet.width * transforms.scaleFactor;
	rootContainer.height = rootViewSet.height * transforms.scaleFactor;
	rootContainer.realX = transforms.realX;
	rootContainer.realY = transforms.realY;
	rootContainer.imposedScaleFactor = transforms.scaleFactor;

	rootViewSet.container = rootContainer;
	
    //render the set's tree of view boxes within the set's container
    renderTheViewTreeOfViewSet( rootViewSet);
	
    console.log("POPDisplay: root view set: " + rootViewSet.ID);

    //Expect the caller to have checked whether the root view set has the
    // outer-most bounding box that all the rest have to be scaled and
    // translated into.
	//This implies that root view set is the parent on all followable
	// links -- any links where it is the child are blocked (outside the
	// rendered sub-graph)
	//This holds when every parent fully contains all its children inside
	// its bounding box..  which makes the graph, visually, into a tree.
	//NOTE: may have to revisit this assumption later.. just want working now
   
    // Mark the view set as "visited this round"
    rootViewSet.makeProcessedTagCurrent();
	
    //Call the recursion with the root view set as the "current" view set
    // so all its children will be visited.
    visitLinkedViewSets( rootViewSet );	
}


/* Walk the links connecting a given view set 
-] This function creates a container for each child view set
- -] It will take the realX and realY out of the parent container, add the
     link's xOffset and yOffset, scaled by the parent container's imposed
	 scaling, to get the realX and realY of the child view set's container.
- -] It will take the imposedScaling out of the root container, multiply
     by the linkScaling in the link, and make that the imposed scaling of
     the child view set's container.
- -] It will then render the view tree of the child view set 
The passed-in view set must already have been marked as "visited this round"
*/
function visitLinkedViewSets( viewSet ) {

    //Get view set's array of links.
    var links = viewSet.viewSetLinks; var currLink; 
	
    //For each view set link:
    for( var linkIdx = 0; linkIdx < links.length; linkIdx++ ) {
        // check whether it's marked "do not pass" or the other side is marked
        // "already visited this view set this round".  If so, skip this link.
        currLink = links[ linkIdx ];
        if( currLink.doNotPass ) continue; //go to next link!
		
        //See whether the current view set is child or parent
        //TODO: test whether this check works!
        if( currLink.parentViewSet === viewSet ) {
			if( currLink.childViewSet.setWasProcessedThisRound() ) continue;
			
            // is un-visited parent, 
			//Don't think can ever get here..  but just in case..
			// Make its container and add this current view as a child.
			
			console.log("not implemented!");
        }
        else if( currLink.childViewSet === viewSet ) {
			//skip if already done
			if( currLink.parentViewSet.tagIsCurrent() ) continue;
						
            // This is an unvisited child of current, so make its container
			var childViewSet = currLink.childViewSet;
			var childContainer = new POPContainer();
			var childScaling = viewSet.container.imposedScaling *
					             currLink.scaleFactor;
			childContainer.width = childViewSet.width * childScaling;
			childContainer.height = childViewSet.height * childScaling;
			childContainer.realX = viewSet.container.realX +
					currLink.xOffset * viewSet.container.imposedScaling;
			childContainer.realY = viewSet.container.realY +
					currLink.yOffset * viewSet.container.imposedScaling;
			childContainer.imposedScaleFactor = childScaling;

			childViewSet.container = childContainer;
			
            //render the set's tree of view boxes within the set's container
			renderTheViewTreeOfViewSet(childViewSet);
			
			// Mark the view set as "visited this round"
			childViewSet.makeProcessedTagCurrent();

			// recursively visit all links to this child
			visitLinkedViewSets( childViewSet );	
        }
        //This link done, go to next link..
    }
}


/* render view tree of a view set
Render to the window all the shapes from one view tree from one view-set

Descend the tree of view boxes breadth-first.  If view box has children
 then make a container for the view box.  
A container has a real x,y and an inherited scale factor.
The view box has an x offset and a y offset, and a local scale within
 its parent view box's bounding box.
So, to calculate the container values, take the parent view box's 
 offset, multiply by the parent container's imposed scaling, to get
 real offset of view box within the parent.  Add these to the parent
 container's real X and real Y, to get the child container's real x,y.
Likewise, the child container's bounding box is calculated.  Start with
 the view box's width and height, multiply those by the local scale to
 get size within parent container, then multiply by parent container's
 imposed scaling, to get final real width and height.
Finally, child container's imposed scaling is the product of local
 scaling factor times parent container's imposed scaling factor.

If view box has a shape, then calculate the real position and the final
 svg-performed scaling to be applied to the shape.
To calc position, 
-] take the view box's x,y, which is relative to the view box's parent's
 bounding box.
-] multiply by the parent container's imposed scaling factor, to get
   real offset from the parent's origin.
-] add these values to parent container's real x, y to get shape's
   real x, y
To calc scaling factor to attach to svg elem:
-] take view box's local scaling and multiply by parent container's
   scaling factor, to yield the scaling factor attached to svg elem

NOTE: doing minimal effort implementation, which will recompute all
	  every time the window is rendered (no memory of containers
	  or anything else.. can be an issue during pan or zoom, and
	  even while working with the menu or placing a wire ending)
*/

function renderTheViewTreeOfViewSet( viewSet ) {

	//will do a breadth-first traversal of the tree.
	//The root container is the view set's container (which was created 
	// before got here, by the view set graph traversal activity)
	//During the traversal, have a current view box, which has a parent
	// container that the view box is rendered into.
	//Process the view box, and push all its children into queue
	// of view boxes to be processed.
	//
	//So, set up for the loop.. 
	var i = 0; var numChildren = 0; 
	var viewBoxesToProcess = []; var parentContainer = {}; 
	var viewBoxChildren = [];
	var newSVGElem; var viewBoxToProcess;
	
	//TODO: decide whether want mousenter and mousexit events on a container,
	// covering the container's entire area, or only on shapes..
	
	// the view set's root view box is made to be the view box to be 
	// processed next then enter the loop
	//NOTE: when have multiple windows onto same syntax graph, then the
	// same view box could be inside multiple containers, a different
	// container in each window!
	//So far haven't made any back-pointers from view-box to container it
	// is inside of..  but do have container pointed to in a view box..
	// as long as only one window is rendered at a time, this is safe, but
	// if rending windows in parallel, the container is created during
	// rendering and will have fighting over view box..
	//Same issue for the parent container of a view box..
	//Will deal with it then..
	viewSet.rootViewBox.parentContainer = viewSet.container;
	viewBoxesToProcess.push( viewSet.rootViewBox );

	//loop, in which get oldest view box in queue each iter
	while( ( viewBoxToProcess = viewBoxesToProcess.shift() ) !== undefined ) {
		parentContainer = viewBoxToProcess.parentContainer;
		
		//Children:  check whether the viewBox has children 
		// If so, create a container so that all children transform
		// together, and have same origin
		if(viewBoxToProcess.children.length !== 0) {
			//make container for the view box
			var boxContainer = new POPContainer();
			var totalScaleFactor = parentContainer.imposedScaleFactor *
								   viewBoxToProcess.localScaleFactor;
			boxContainer.width = viewBoxToProcess.width * totalScaleFactor;
			boxContainer.height = viewBoxToProcess.height * totalScaleFactor;
			boxContainer.realX = parentContainer.realX + 
					viewBoxToProcess.xOffset * 
					parentContainer.imposedScaleFactor;
			boxContainer.realY = parentContainer.realY + 
					viewBoxToProcess.yOffset * 
					parentContainer.imposedScaleFactor;
			boxContainer.imposedScaleFactor = 
					parentContainer.imposedScaleFactor *
					viewBoxToProcess.localScaleFactor;

			viewBoxToProcess.container = boxContainer;
			
			//push the children into the queue
			viewBoxChildren = viewBoxToProcess.children;
			numChildren = viewBoxChildren.length;
			console.log("Display Rendering: numChildren: " + numChildren);

			var currChildViewBox;
			for( i=0; i < numChildren; i++ ) {
				currChildViewBox = viewBoxChildren[i];
				currChildViewBox.parentContainer = viewBoxToProcess.container;
				viewBoxesToProcess.push( currChildViewBox );
			}
			
		}
		
		//Shape: if viewbox has a shape, render that
		if( viewBoxToProcess.shape ) {
			renderShapeOfViewBox( viewBoxToProcess );
		}
	} //while
}

//render the shape of a view box
function renderShapeOfViewBox( viewBox ) {
	//render by making an SVG elem, which is added directly to the
	// svg root.  The elem contains the shape string.  The final shift and
	// scale is calculated by combining the container shift and scale with
	// the shape's shift and size.  The shift is then applied directly to
	// the SVG elem, and the scale is added as a transform.
	var container = viewBox.parentContainer;
	var shape  = viewBox.shape; //an SVG string!
		//note that if the shape SVG is to be offset from the view box
		// origin, then it has to be done as a child view box!
	var shapeX =	viewBox.xOffset * container.imposedScaleFactor +
					container.realX;
	var shapeY =	viewBox.yOffset * container.imposedScaleFactor +
					container.realY;
	var scaleFactor =	container.imposedScaleFactor * 
						viewBox.localScaleFactor;
	newSVGElem = new SVGElem(	shape, shapeX, shapeY, 
								scaleFactor, viewBox );
}


var SVG_NS="http://www.w3.org/2000/svg";
function SVGElem( shapeStr, shapeX, shapeY, scale, viewBox ) {
   var SVGObj= document.createElementNS(SVG_NS,"svg");
   SVGObj.innerHTML = shapeStr;
   SVGObj.x.baseVal.value=shapeX;
   SVGObj.y.baseVal.value=shapeY;
   SVGObj.setAttribute('transform', "scale(" + scale + ")" );
   //can also give both x and y scale factors, as in: "scale(2,2)";
   
   //add a way for generic POP event handler to go backwards to the 
   // view box.  It gets the SVG obj in the event, uses this backlink.
   SVGObj.correspondingViewBox = viewBox;

   //Add the generic POP event handlers to the svg element
   SVGObj.onclick=svgClick;
   SVGObj.onmouseenter=svgMouseEnter;
   SVGObj.onmouseout=svgMouseOut;
   __POPSVGRoot.appendChild( SVGObj );
   return SVGObj;
}

/*Generic click event handler invokes the view box's click event handler.
 * It does so by getting the SVG element out of the event object,
 * and from there obtains the pointer back to the view box, and uses that 
 * to invoke the event handler that was attached to the view box by the 
 * visualizer.
 * That event handler has behavior specific to that particular view-box, and
 * more generally has behavior specific to the type of holder.
 */

/*Generic event handler 
 * 
 */
var svgMouseEnter = function(e) {
	var msg =  "mouse enter SVG";
	console.log(msg);
	var test = document.getElementById("msgEl"); 
	test.innerHTML = msg;
};

var svgMouseOut = function(e) {
	var msg =  "mouse exit SVG";
	console.log(msg);
	var test = document.getElementById("msgEl"); 
	test.innerHTML = msg;
};

	var svgClick = function(e) {
   var msg = "event: " + e.type + " target: " + e.origin.id;
   msgEl.innerHTML = msg;
   console.log(msg);
};

/*Get best shape to handle a key down event by looking first at the view
 * box that's at the end of the mouse-enter chain.  
 */
function getBestShapeToHandleKeyDownEvent(e){
  return __POPSVGRoot.correspondingViewBox.shape;
}

function prettyPrintObject(obj){
	console.log( JSON.stringify({"foo":"lorem","bar":"ipsum"}, null, '\t') );
}
function prettyPrintObject2(obj) { DumpObjectIndented(obj, null); }
function DumpObjectIndented(obj, indent)
{
    var result = "";
    if (indent === null) indent = "";

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
}

function connectToCommander( commanderIn ) {
	commander = commanderIn;
	console.log("Display connect to commander");
}

return{
	init:				init,
	connectToCommander:	connectToCommander,
	renderWindow:		renderWindow
};
});


