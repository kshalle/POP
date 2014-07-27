//A syntax graph consists of two kinds of nodes: element, port, and property 
//An element node can have sub-elements, and a property node can have
// sub-properties, but a port node may not have sub-ports!

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


//Housekeeping.. define helper Fn.  Get next ID -- should be globally visible
// and shared amongst all code..  need persistent counters, so must be closure
var currID = 0;
var getNextID = function() {
//        console.log("getNextID: " + currID );
        return currID++;
}

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

//this is the top level handle to the syntax graph of the gabe transform rule
var firstGabeTransformRule = {
	root: {},
	viewRoot: {}
};

//As create each node of the syntax graph, are going to give it a bounding
// box, and place it inside of a parent bounding box.
//Note that there are more view-hierarchy elements than there are syntax graph
// nodes!  Not only does a single node get visualized by multiple boxes (Ex: 
// each text string inside a node has its own bounding box!)..  but also, 
// hierarchy nodes group together multiple syntax graph nodes, but have no
// direct shape that of their own that is drawn.

//When create a bounding box, size and position are relative to the parent
// bounding box, and no other size or position is declared.  However, it
// inherits the scalings and translations of ancestor boxes.

//For the top of the hierarchy, make a bounding box that will be the ancestor
// of all of the elements contained within the sub-graph that is the Gabe
// Pattern syntax graph.
//This bounding box is not the bounding box of the root syntax graph element!
// So, the handle that holds the root must have a separate field that holds
// the root of the view hierarchy.  From there, the view hierarchy can be
// traversed..  note that each syntax graph node does have one or more 
// bounding boxes that represent it, BUT hierarchy bounding boxes exist that
// are not attached to any syntax graph element!  They can only be reached
// by separately traversing the view hierarchy.

var tempViewBox = {
	ID: undefined,
	shape: undefined,
	width: 0,		//size of bounding box (before scaling)
	height: 0,
	xOffset: 0,		//offset moves self and all descendants rel to parent
	yOffset: 0,
	scale: 1.0,		//scale applies to self and all descendants
	parent: undefined,	//allows traversing upward through hierarchy
	children: [],	//these are children view bounding boxes
	handlers: []	//array of objects -> { typeOfEvent, Fn }
};

//make the viewRoot bounding box
tempViewBox.ID = getNextID();
tempViewBox.shape = undefined;
tempViewBox.width = 1000;
tempViewBox.height = 700;
tempViewBox.xOffset = 0;
tempViewBox.yOffset = 0;
tempViewBox.scale = 1.0;
tempViewBox.parent = undefined;
tempViewBox.handlers.push({
	type: 'key',
	fn: stdKeyHdlr
});

firstGabeTransformRule.viewRoot = tempViewBox;


//make a variable that holds an empty element struct.. this var will be used
// to build up an element, and then reused to build up other elements 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   [],
   viewBox:   {}
 };
 
//make svg box for the graph element..  but don't know the width yet!
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

//make the root element's bounding box: shape, width, height, xOff, yOff, scale
tempViewBox = makeNewViewBox( boxSVGFromParts1_1, BBox1_1w, BBox1_1h, 0, 0, 1.0 );
console.log("root box ID: " + tempViewBox.ID );
tempViewBox.shape = boxSVGFromParts1_1;
tempViewBox.width = BBox1_1w;
tempViewBox.height = BBox1_1h;
tempViewBox.xOffset = box1_1x;
tempViewBox.yOffset = box1_1y;
tempViewBox.scale = 1.0;
tempViewBox.handlers.push({
	type: 'key',
	fn: stdKeyHdlr
});

//now cross link everything -- the view box, it's parent, and the graph node
tempViewBox.parent = firstGabeTransformRule.viewRoot;
firstGabeTransformRule.viewRoot.children.push( tempViewBox );
tempElem.viewBox = tempViewBox;
tempViewBox.linkedNode = tempElem;

//Set the root of the Gabe Transform to be the temp elem
firstGabeTransformRule.root = tempElem; 

//Do the view boxes for the text strings that are inside the SVG box

//now set the SVG text string -- from this point down can be repeated 
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
tempViewBox = makeNewViewBox( text1_1_1_SVG, rect.width, rect.height, 8, 8, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: stdKeyHdlr });

//cross link the view box, it's parent, and the graph node (if any)
tempViewBox.parent = firstGabeTransformRule.root.viewBox;
firstGabeTransformRule.root.viewBox.children.push(tempViewBox);

var text1_1_2_SVG = makeSVGTextStr("portsIn");
txtSzEl.innerHTML = text1_1_2_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = makeNewViewBox( text1_1_2_SVG, rect.width, rect.height, 8, 25, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: stdKeyHdlr });

//cross link the view box, it's parent, and the graph node (if any)
tempViewBox.parent = firstGabeTransformRule.root.viewBox;
firstGabeTransformRule.root.viewBox.children.push(tempViewBox);

var text1_1_3_SVG = makeSVGTextStr("portsOut");
txtSzEl.innerHTML = text1_1_3_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = makeNewViewBox( text1_1_3_SVG, rect.width, rect.height, 8, 42, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: stdKeyHdlr });

//cross link the view box, it's parent, and the graph node (if any)
tempViewBox.parent = firstGabeTransformRule.root.viewBox;
firstGabeTransformRule.root.viewBox.children.push(tempViewBox);

var text1_1_4_SVG = makeSVGTextStr("subElems");
txtSzEl.innerHTML = text1_1_4_SVG;
var gottenElem = document.getElementById("svgText");
var rect = gottenElem.getBoundingClientRect();
//The x of 8 and y of 25 are fixed positions for this text in an element node!
tempViewBox = makeNewViewBox( text1_1_4_SVG, rect.width, rect.height, 8, 59, 1.0 );
tempViewBox.handlers.push({ type: 'key', fn: stdKeyHdlr });

//cross link the view box, it's parent, and the graph node (if any)
tempViewBox.parent = firstGabeTransformRule.root.viewBox;
firstGabeTransformRule.root.viewBox.children.push(tempViewBox);




//build the first property
var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "GabeTransformRule",
   subProperties: [],
   viewBox:      []
 }
 
//attach it to the root elem
firstGabeTransformRule.root.properties[0] = tempProperty;

//build and attach the second property
var tempProperty = 
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: [],
   viewBox:      []
 }

firstGabeTransformRule.root.properties[1] = tempProperty;

//now reuse tempElem to make the first sub-element of the root elem 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   [],
   viewBox:   []
 }

firstGabeTransformRule.root.subElems[0] = tempElem;

var tempProperty = 
 { propertyName:  "TypeOfElement",
   propertyValue: "GabeQueryPattern",
   subProperties: [],
   viewBox:      []
 }
 
tempElem.properties[0] = tempProperty;

var tempProperty =
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: [],
   viewBox:      []
 }
  
tempElem.properties[1] = tempProperty;


//Keep going, building up the graph that was drawn
//make the second sub-element of the root elem, the replacement pattern 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   [],
   viewBox:   []
 }

firstGabeTransformRule.root.subElems[1] = tempElem;

var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "GabeReplacePattern",
   subProperties: [],
   viewBox:      []
 }
 
tempElem.properties[0] = tempProperty;

var tempProperty =
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: [],
   viewBox:      []
 }
  
tempElem.properties[1] = tempProperty;

//Now, go back and fill in the rest of the query pattern
//First, add the sub-elements of the query pattern node
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 };

firstGabeTransformRule.root.subElems[0].subElems[0] = tempElem;

var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "Command",
   subProperties: []
 };
 
tempElem.properties[0] = tempProperty;

var tempProperty =
 { propertyName: "CommandID",
   propertyValue: "GabePattPush",
   subProperties: []
 };

tempElem.properties[0].subProperties[0] = tempProperty;

 
var tempProperty =
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticPatternRoot",
   subProperties: []
 };
  
tempElem.properties[1] = tempProperty;

//now add the ports to this Command syntactic pattern
var tempPort =
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

tempElem.portsIn[0] = tempPort;

//add properties to the port
tempPort.properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };

//check that syntax was done correctly..
fillText = tempPort.properties[0].subProperties[0].propertyName;
console.log("propertyName: " + fillText);


var tempPort =
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

tempElem.portsIn[1] = tempPort;

//add properties to the port
tempPort.properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "float",
      subProperties: []
    }]
 };
 

var tempPort =
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

tempElem.portsOut[0] = tempPort;

//add properties to the port
tempPort.properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };

//First command (push) done!  Now make second command (head)
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 };

firstGabeTransformRule.root.subElems[0].subElems[1] = tempElem;

//getting tired of the temp this and temp that, just make object directly
tempElem.properties[0] = 
 { propertyName: "TypeOfElement",
   propertyValue: "Command",
   subProperties: 
    [{ propertyName: "CommandID",
      propertyValue: "GabePattPop",
      subProperties: []
    }]
 };
  
tempElem.properties[1] = 
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticPatternRoot",
   subProperties: []
 };

//now add the ports to this Command syntactic pattern
tempElem.portsIn[0] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsIn[0].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };

//next port
tempElem.portsOut[0] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsOut[0].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };


//next port
tempElem.portsOut[1] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsOut[1].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "float",
      subProperties: []
    }]
 };

//now pair the ports to each other
var pushElem = firstGabeTransformRule.root.subElems[0].subElems[0];
var popElem = firstGabeTransformRule.root.subElems[0].subElems[1];

pushElem.portsOut[0].pairedPorts[0] =
   popElem.portsIn[0];
popElem.portsIn[0].pairedPorts[0] =
   pushElem.portsOut[0];

//Done with the query pattern!

//========================================
//Now do the replace pattern
//========================================
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 };

firstGabeTransformRule.root.subElems[1].subElems[0] = tempElem;

//This is the pass through command element
tempElem.properties[0] = 
 { propertyName: "TypeOfElement",
   propertyValue: "Command",
   subProperties: 
    [{ propertyName: "CommandID",
      propertyValue: "GabePassThrough",
      subProperties: []
    }]
 };

tempElem.properties[1] = 
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticPatternRoot",
   subProperties: []
 };

//now add the ports to this Command syntactic pattern
tempElem.portsIn[0] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsIn[0].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };

//next port
tempElem.portsIn[1] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsIn[1].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "float",
      subProperties: []
    }]
 };


//next port
tempElem.portsOut[0] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsOut[0].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "GabePattStack",
      subProperties: []
    }]
 };


//next port
tempElem.portsOut[1] = 
 { element: tempElem,
   properties: [],
   pairedPorts: []
 };

//add properties to the port
tempElem.portsOut[1].properties[0] =
 { propertyName: "TypeOfPort",
   propertyValue: "dataComm",
   subProperties: 
    [{ propertyName: "TypeOfCommData",
      propertyValue: "float",
      subProperties: []
    }]
 };

//no paired ports in this one..  done done!!

//print a few things, just to make sure the data structs are correctly
// created and can be traversed.
var passThroughCmd = firstGabeTransformRule.root.subElems[1].subElems[0];
fillText = passThroughCmd.portsOut[1].properties[0].subProperties[0].propertyValue;
console.log("propertyValue: " + fillText);


function stdKeyHdlr(e) {
	console.log("bb event: " + e.type + " on: " + e.target.ID);
}

function makeNewViewBox(shape, width, height, x, y, scale){
	var tempViewBox = {
		ID: undefined,
		shape: shape,
		width: width,	//size of bounding box (before scaling)
		height: height,
		xOffset: x,		//offset moves self and all descendants rel to parent
		yOffset: y,
		scale: scale,	//scale applies to self and all descendants
		parent: undefined,	//allows traversing upward through hierarchy
		children: [],	//these are children view bounding boxes
		handlers: []	//array of objects -> { typeOfEvent, Fn }
	};
    tempViewBox.ID = getNextID();
	return tempViewBox;
}

function makeSVGTextStr(textContent) {
	return '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + textContent + '</text> </svg>';
}

//when this module is "required", the require statement will return the
// syntax graph data structure
return firstGabeTransformRule;
});






