//A syntax graph consists of two kinds of nodes: element, port, and property 
//An element node can have sub-elements, and a property node can have
// sub-properties, but a port node may not have sub-port

//This uses require.js to create a module.  This module has the name of the
// file (<currFileName>).  Inside the define, a number of data structures and 
// functions are created, then returned at the end.  The returned things are
// what can be accessed by external functions that load this module, via
// themselves using the require("<currFileName>") call


//The syntax graph is being modified to include visualization information.
//It may be cleaner to store visualization information separately, but it
// turns out to be more convenient to place the visual info directly with
// the thing visualized.
//Will need to provide a means for each viewer to have their own separate
// view information.  Also need a means for creating a default view that
// a particular person's state gets reset to when others have modified
// the graph too far for their old view info to make sense anymore..
//This is a bit of a messy problem!  Making the view always fully dynamic,
// computed on the fly would solve the issues, but it would take away the
// programmer's experience of being able to tune the view to their preference.
//So, for now, until get more experience and get deeper into this, just 
// making all the view info be attached to the nodes as the graph is 
// constructed.  The system guesses a placemnt, then it is up to the user
// to move things around to suit their preference.  The movement can be 
// automated later..  simplest approach for now is make all placement 
// manual and save the placement inside the graph.  But will at least
// make the info be stored in an array indexed by user (separately
// hash user-name which looks up the index of that user-name. Recycle indexes)
define( function(require, exports, module) {

//In final impl, all SVG for shapes will be generated by the visualizer,
// but during the steps to get from here to there, are temporarily putting the
// SVG generation inside the graph builder.
//The goal is for the visualizer to construct the SVG strings when triggered
// by the Modifier.  The Modifier indicates what was changed, and the 
// Visualizer calculates the new shapes and placements.
//For some gestures, such as dragging, the Modifier will directly modify
// positions.  Which one does the calcs -- the Modifier vs the Visualizer -- 
// is decided on a case by case basis.


//========================================================================
//==
//========================================================================
//Housekeeping.. setup

//this is the top level handle to the syntax graph of the gabe transform rule
var firstGabeTransformRule = {
    rootElem: {},
    rootViewSet: {}
};

//Get the class objects that define behavior for each of the structures that
// appears in a POP syntax graph.. will use these as read in JSON of a graph
// and parse it into objects of these classes!
var graphClasses = require("./POPGraphClasses");

var theObjColl = graphClasses.theObjColl;

//check this works
var GraphElem      = graphClasses.GraphElem;
var ViewSet        = graphClasses.ViewSet;
var ViewSetLink    = graphClasses.ViewSetLink;
var ViewBox        = graphClasses.ViewBox;
var GraphProperty  = graphClasses.GraphProperty;
var GraphPort      = graphClasses.GraphPort;


//So, for now, set up for generating SVG..  this and the code below that
// uses it will move into the Visualizer at some point
var boxSVG = [];
boxSVG[1] = '<svg width="'; //start at 1!  makes things simpler..
boxSVG[2] = '" height="';
boxSVG[3] = '"><rect x="';
boxSVG[4] = '" y="';
boxSVG[5] = '" rx="'
boxSVG[6] = '" ry="';
boxSVG[7] = '" width="'
boxSVG[8] = '" height="'
boxSVG[9] = '" style="fill:'
boxSVG[10] = ';stroke:'
boxSVG[11] = ';stroke-width:'
boxSVG[12] = ';opacity:'
boxSVG[13] = '" vector-effect="non-scaling-stroke">';

//Create a DOM element that will use for discovering the bounding boxes of 
// text that is to be drawn to the canvas
//Do this part once, the creating of a DOM element and adding it to document
var txtSzEl =  document.createElement("div");
document.body.appendChild(txtSzEl); //only need to append once then reuse

var textContent = "";

//===========================================================================
//==
//==     Build the Graph
//==
//===========================================================================


//make a variable that holds an empty element struct.. this shows the
// structure of what's in an element node
var tempElem = new GraphElem();

//Set the root elem.
firstGabeTransformRule.rootElem = tempElem;

//=======================================================
//==    Do the View Set
//=======================================================

//As create each node of the syntax graph, are going to link it to a view
// set, which in turn has a tree of view boxes.  This tree consists of all
// the visual elements related to that syntax graph element, including
// properties attached, shapes that visualize the element, ports in and out
// and so forth.
//Note that there is one view-set for each element node, even if the elem
// has no visual behavior.
//Note also that there are often multiple view boxes for a single elem node!
// Ex: each text string inside a node has its own bounding box!  There may
// also be view boxes that have no shape, but just act as reference points
// that apply translations and scalings to other boxes.

//When create a bounding box, size and position are relative to the parent
// bounding box, and no other size or position is declared.  However, it
// inherits the scalings and translations of ancestor boxes.

//Note that the root graph elem may just be, visually, one sibling amongst
// many!  Hence, the root view set cannot be the view set of the root
// graph elem.
//So, for this particular instance of the Gabe Patter, make a root view-set
// from which access the view-set of the root graph elem.
//Hence, the handle that holds the root must have a separate field that holds
// the root of the view hierarchy.  From there, the view hierarchy can be
// traversed..

//Each element in the syntax graph has a corresponding tree of view boxes
// that visualize that element, and the input boxes.  The bounding
// boxes in this tree can only be reached by going through the view-set,
// the view-set is only attached to the element node in the syntax graph.
//But view-sets are attached to each other via view-link objects!

//here is the root view set, which is above the view set of the root elem
var tempViewSet = new ViewSet();
firstGabeTransformRule.rootViewSet = tempViewSet;
tempViewSet.syntaxElem = undefined;
tempViewSet.rootViewBox = undefined; //may change this, make it the
//enclosing bounding box for the entire thing.

//add a link object, that links between two view sets
var tempViewSetLink = new ViewSetLink();
tempViewSet.viewSetLinks[0] = tempViewSetLink;
tempViewSetLink.referenceViewSet = firstGabeTransformRule.rootViewSet;
tempViewSetLink.subordinateViewSet = new ViewSet();
tempViewSetLink.subordinateViewSet.syntaxElem = firstGabeTransformRule.rootElem;

//now, hook up the root elem to its newly created view set!
tempViewSet = tempViewSetLink.subordinateViewSet;
firstGabeTransformRule.rootElem.viewSet = tempViewSet;

//this is what a view box looks like:
var tempViewBox = new ViewBox();

//make the root bounding box of the view tree for the root graph elem
tempViewBox.width = 1000;
tempViewBox.height = 700;
tempViewBox.xOffset = 0;
tempViewBox.yOffset = 0;
tempViewBox.scale = 1.0;
tempViewBox.parent = undefined;
tempViewBox.handlers.push({
    type: 'key',
    fn: graphClasses.stdKeyHdlr
});

//set this view box as the root of the view set
tempViewSet.rootViewBox = tempViewBox;
tempViewBox.parent = tempViewSet; //(type issues?)

//Now make svg box for the root graph element..  but don't know the width yet!
// hence, can't generate the svg string yet..  only after getting the
// bounding boxes of all text inside the element can the final width
// of the box be calculated, and then the svg string be generated
//However, going in baby steps, so at the moment, assume all sizes are known,
// then get the rendering from this graph+view structure working,
// THEN worry about how to calculate the box size from the text strings
//The visualizer is the thing that does these size and placement calcs and
// generates the SVG string.. so this is "canned" code that will be removed
var box1_1x = 0;
var box1_1y = 2;
var box1_1w = 66; var box1_1h = 86; var box1_1pad = 2;
var BBox1_1w = box1_1w + box1_1pad; var BBox1_1h = box1_1h + box1_1pad;

var boxSVGFromParts1_1 = boxSVG[1] + BBox1_1w + boxSVG[2] + BBox1_1h + boxSVG[3] + '1' + boxSVG[4] + '1' + boxSVG[5] + '20' + boxSVG[6] + '20' + boxSVG[7] + box1_1w + boxSVG[8] + box1_1h + boxSVG[9] + 'none' + boxSVG[10] + 'red' + boxSVG[11] + '2' + boxSVG[12] + '1' + boxSVG[13];
tempViewBox.shape = boxSVGFromParts1_1;

console.log("rootElem root view box ID: " + tempViewBox.ID );

//add a handler for key down while over the shape for root elem
tempViewBox.handlers.push({
	type: 'key',
	fn: graphClasses.stdKeyHdlr
});

//save this view box to be the parent of the text's view boxes, which go inside it
var tempParentViewBox = tempViewBox;

//Do the view boxes for the text strings that are inside the SVG box

//set the SVG text string -- from this point down can be repeated
// for multiple strings without removing or re-adding the element, nor
// fiddling with the DOM
textContent = "properties";
var text1_1_1_SVG = makeSVGTextStr("properties");

//note that id is inside the text element! Also the fill and stroke are
// null so that nothing paints
txtSzEl.innerHTML = text1_1_1_SVG; 

//get the element -- this seems to be what triggers the bounding box calc
var gottenElem = document.getElementById("svgText"); //use ID of the text elem

//get the box, take the values out of it, and display them
var rect = gottenElem.getBoundingClientRect();
//make a new view box object and populate it for the text box
//The x of 8 and y of 8 are fixed positions for an element node!
tempViewBox = new ViewBox().WithParams( text1_1_1_SVG, rect.width, rect.height, 8, 8, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: graphClasses.stdKeyHdlr });

//add view box into the tree
tempViewBox.parent = tempParentViewBox;
tempParentViewBox.children.push(tempViewBox);

var text1_1_2_SVG = makeSVGTextStr("portsIn");
txtSzEl.innerHTML = text1_1_2_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = new ViewBox().WithParams( text1_1_2_SVG, rect.width, rect.height, 8, 25, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: graphClasses.stdKeyHdlr });

//add view box into the tree
tempViewBox.parent = tempParentViewBox;
tempParentViewBox.children.push(tempViewBox);

var text1_1_3_SVG = makeSVGTextStr("portsOut");
txtSzEl.innerHTML = text1_1_3_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = new ViewBox().WithParams( text1_1_3_SVG, rect.width, rect.height, 8, 42, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: graphClasses.stdKeyHdlr });

//add view box into the tree
    tempViewBox.parent = tempParentViewBox;
    tempParentViewBox.children.push(tempViewBox);

var text1_1_4_SVG = makeSVGTextStr("linkedElems");
txtSzEl.innerHTML = text1_1_4_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = new ViewBox().WithParams( text1_1_4_SVG, rect.width, rect.height, 8, 59, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: graphClasses.stdKeyHdlr });

//add view box into the tree
tempViewBox.parent = tempParentViewBox;
tempParentViewBox.children.push(tempViewBox);


//=========================================================
//==
//=========================================================

//build the first property
var tempProperty = new GraphProperty().WithParams("TypeOfElement", "GabeTransformRule");

//attach it to the root elem
firstGabeTransformRule.rootElem.properties[0] = tempProperty;

//build and attach the second property
tempProperty = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticHierarchy");

firstGabeTransformRule.rootElem.properties[1] = tempProperty;

//now reuse tempElem to make the first sub-element of the root elem 
tempElem = new GraphElem();

firstGabeTransformRule.rootElem.linkedElems[0] = tempElem;

tempProperty = new GraphProperty().WithParams("TypeOfElement", "GabeQueryPattern");
 
tempElem.properties[0] = tempProperty;

tempProperty = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticHierarchy");
  
tempElem.properties[1] = tempProperty;


//Keep going, building up the graph that was drawn
//make the second sub-element of the root elem, the replacement pattern 
tempElem = new GraphElem();

firstGabeTransformRule.rootElem.linkedElems[1] = tempElem;

tempProperty = new GraphProperty().WithParams("TypeOfElement", "GabeReplacePattern");
 
tempElem.properties[0] = tempProperty;

var tempProperty = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticHierarchy");
  
tempElem.properties[1] = tempProperty;

//Now, go back and fill in the rest of the query pattern
//First, add the sub-elements of the query pattern node
tempElem = new GraphElem();

firstGabeTransformRule.rootElem.linkedElems[0].linkedElems[0] = tempElem;

tempProperty = new GraphProperty().WithParams("TypeOfElement", "Command");
 
tempElem.properties[0] = tempProperty;

tempProperty = new GraphProperty().WithParams("CommandID", "GabePattPush");

tempElem.properties[0].subProperties[0] = tempProperty;

tempProperty = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticPatternRoot");
  
tempElem.properties[1] = tempProperty;

//now add the ports to this Command syntactic pattern
tempPort = new GraphPort().WithElem( tempElem );

tempElem.portsIn[0] = tempPort;

//add properties to the port
tempPort.properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempPort.properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");

//check that syntax was done correctly..
fillText = tempPort.properties[0].subProperties[0].propertyValue;
console.log("check propertyValue should be GabePattStack: " + fillText);

tempPort = new GraphPort().WithElem( tempElem );

tempElem.portsIn[1] = tempPort;

//add properties to the port
tempPort.properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempPort.properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "float");

tempPort = new GraphPort().WithElem( tempElem );

tempElem.portsOut[0] = tempPort;

//add properties to the port
tempPort.properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempPort.properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");


//First command (push) done!  Now make second command (head)

tempElem = new GraphElem();
firstGabeTransformRule.rootElem.linkedElems[0].linkedElems[1] = tempElem;
tempElem.properties[0] = new GraphProperty().WithParams("TypeOfElement", "Command");
tempElem.properties[0].subProperties[0] = new GraphProperty().WithParams("CommandID", "GabePattPop");

tempElem.properties[1] = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticPatternRoot");

tempPort = new GraphPort().WithElem( tempElem );

tempElem.portsIn[0] = tempPort;

//add properties to the port
tempPort.properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempPort.properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");

//next port
tempElem.portsOut[0] = new GraphPort().WithElem( tempElem );
tempElem.portsOut[0].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsOut[0].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");

//next port
tempElem.portsOut[1] = new GraphPort().WithElem( tempElem );
tempElem.portsOut[1].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsOut[1].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "float");

//now pair the ports to each other
var pushElem = firstGabeTransformRule.rootElem.linkedElems[0].linkedElems[0];
var popElem = firstGabeTransformRule.rootElem.linkedElems[0].linkedElems[1];

pushElem.portsOut[0].pairedPorts[0] = popElem.portsIn[0];
popElem.portsIn[0].pairedPorts[0] = pushElem.portsOut[0];

//Done with the query pattern!

//========================================
//Now do the replace pattern
//========================================

//This is the pass through command element
tempElem = new GraphElem();
firstGabeTransformRule.rootElem.linkedElems[1].linkedElems[0] = tempElem;
tempElem.properties[0] = new GraphProperty().WithParams("TypeOfElement", "Command");
tempElem.properties[0].subProperties[0] = new GraphProperty().WithParams("CommandID", "GabePassThrough");
tempElem.properties[1] = new GraphProperty().WithParams("TypeOfSyntacticStructure", "syntacticPatternRoot");

tempElem.portsIn[0] = new GraphPort().WithElem( tempElem );

//add properties to the port
tempElem.portsIn[0].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsIn[0].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");

tempElem.portsIn[1] = new GraphPort().WithElem( tempElem );

//add properties to the port
tempElem.portsIn[1].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsIn[1].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "float");

//next port
tempElem.portsOut[0] = new GraphPort().WithElem( tempElem );
tempElem.portsOut[0].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsOut[0].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "GabePattStack");

//next port
tempElem.portsOut[1] = new GraphPort().WithElem( tempElem );
tempElem.portsOut[1].properties[0] = new GraphProperty().WithParams("TypeOfPort", "dataComm");
tempElem.portsOut[1].properties[0].subProperties[0] = new GraphProperty().WithParams("TypeOfCommData", "float");

function makeSVGTextStr(textContent) {
	return '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + textContent + '</text> </svg>';
}

//when this module is "required", the require statement will return the
// syntax graph data structure
console.log("done building syntax graph")
return firstGabeTransformRule;
});



