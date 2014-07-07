
var c = document.getElementById("POPCanvas");
var ctx = c.getContext("2d");
var foreGroundFill = "#000000";
var backGroundFill = "#FFFFFF";
ctx.font = "14px Arial";
ctx.fillStyle = foreGroundFill;
var fillText = "Hello World";
ctx.fillText(fillText,10,50);

alert("hello!");

ctx.fillStyle = backGroundFill;
ctx.fillText(fillText,10,50);

//A syntax graph consists of two kinds of nodes: element, port, and property 
//An element node can have sub-elements, and a property node can have
// sub-properties, but a port node may not have sub-ports!

//this is the top level handle to the syntax graph of the gabe transform rule
var firstGabeTransformRule = {};

//make a variable that holds an empty element struct.. this var will used
// to build up an element, and then reused to build up other elements 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 };
 
//the root of the Gabe Transform to the temp elem, then build up a property
// to place into the elem.
firstGabeTransformRule.root = tempElem; 

//build the first property
var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "GabeTransformRule",
   subProperties: []
 }
 
//attach it to the root elem
firstGabeTransformRule.root.properties[0] = tempProperty;

//build and attach the second property
var tempProperty = 
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: []
 }

firstGabeTransformRule.root.properties[1] = tempProperty;

//now reuse tempElem to make the first sub-element of the root elem 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 }

firstGabeTransformRule.root.subElems[0] = tempElem;

var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "GabeQueryPattern",
   subProperties: []
 }
 
tempElem.properties[0] = tempProperty;

var tempProperty =
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: []
 }
  
tempElem.properties[1] = tempProperty;


//Keep going, building up the graph that was drawn
//make the second sub-element of the root elem, the replacement pattern 
var tempElem = 
 { properties: [],
   portsIn:    [],
   portsOut:   [],
   subElems:   []
 }

firstGabeTransformRule.root.subElems[1] = tempElem;

var tempProperty = 
 { propertyName: "TypeOfElement",
   propertyValue: "GabeReplacePattern",
   subProperties: []
 }
 
tempElem.properties[0] = tempProperty;

var tempProperty =
 { propertyName: "TypeOfSyntacticStructure",
   propertyValue: "syntacticHierarchy",
   subProperties: []
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
ctx.fillStyle = foreGroundFill;
fillText = tempPort.properties[0].subProperties[0].propertyName;

ctx.fillText(fillText,10,50);

alert("printf!");

ctx.fillStyle = backGroundFill;
ctx.fillText(fillText,10,50);


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
ctx.fillStyle = foreGroundFill;
var passThroughCmd = firstGabeTransformRule.root.subElems[1].subElems[0];
fillText = passThroughCmd.portsOut[1].properties[0].subProperties[0].propertyValue;

ctx.fillText(fillText,10,50);

var el2 =  document.createElement("printf")
el2.style.display="block";
el2.style.width="100%";
el2.innerHTML = fillText;
document.body.appendChild(el2);

alert("printf!");

ctx.fillStyle = backGroundFill;
ctx.fillText(fillText,10,50);

document.body.removeChild(el2);





