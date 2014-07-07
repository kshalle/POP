

define(function(require, exports, module) {
    var Engine           = require("famous/core/Engine");
    var Surface          = require("famous/core/Surface");
    var Modifier         = require("famous/core/Modifier");
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
	var EventHandler      = require('famous/core/EventHandler');
	
    var mainContext = Engine.createContext();
	
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

	
//Draw a simple syntax graph, with a box of the correct color for each
// node, and curvy links with arrows going from text inside one node to
// text inside another node.
//Approach taken:
//Generate the SVG from calculations -- hold strings in an array, and
// build up an SVG string by adding string piece, then variable value then
// another string piece, and so on.
//Make each box a surface holding an SVG
//Sizing of the box happens inside the SVG string
//Positioning the box happens via a modifier

//Make one container surface to hold each element node together with its
// properties and ports
//Make a separate surface for each SVG element -- one for each box, one for
// each text in a box, one for each curvy connector arrow between boxes or
// between texts.  
//For each surface, make a modifier that positions the box relative to the
// container surface's origin
//At the end, make transforms to move the entire container around

	//elem1 is the root element from the Gabe Pattern syntax graph
	// here, make the visual elements that reproduce what see in the .pdf
    var elem1Container = new ContainerSurface({
        size: [600, 600], //size it big for now, trim to contents later
        properties: {
            overflow: 'hidden'
        }
    });
	var retRootBox = {
		ID: "retRootBox",
		width: elem1Container.size[0],
		height: elem1Container.size[1],
		shape: null
	}

	
//==
//	1:width 2:height 3:x 4:y 5:rx 6:ry 7:width 8:height 9:fill 10:stroke
//  11:stroke-width 12:opacity
	var box1_1w = 66; var box1_1h = 86; var box1_1pad = 2;
	var boxSVGFromParts1_1 = boxSVG[1] + (box1_1w + box1_1pad) + boxSVG[2] + (box1_1h + box1_1pad) + boxSVG[3] + '1' + boxSVG[4] + '1' + boxSVG[5] + '20' + boxSVG[6] + '20' + boxSVG[7] + box1_1w + boxSVG[8] + box1_1h + boxSVG[9] + 'none' + boxSVG[10] + 'red' + boxSVG[11] + '2' + boxSVG[12] + '1' + boxSVG[13];

//== elem1 box 1 --> box1_1
	var box1_1 = new Surface({
	  size: [true, true],
      content: boxSVGFromParts1_1
	});
	var box1_1x = 0;
	var box1_1y = 2;
	var boxMod1_1_1 = new StateModifier({
        transform: Transform.translate(box1_1x, box1_1y, 0)
    });

	var retElemBox = {
		ID: "retElemBox",
		x: box1_1x,
		y: box1_1y,
		width: box1_1w + box1_1pad, //outside of SVG BBox NOT shape in box
		height: box1_1h + box1_1pad,
		shape: boxSVGFromParts1_1
	}

	//Below, calculate a bezier curve that is anchored at the end of such
	// text, so need the bounding box of a text element..  to do so, must 
	// first render the text!  That appears to be the only way to calculate
	// the bounding box.. there doesn't seem to be any other means to predict
	// it.
	//So, the famous infrastructure is a bit messed up when it comes to this
	// instead, will directly manipulate the DOM, by placing the text as
	// an SVG element with fill and stroke set to none so it is not
	// visible.  Then use the DOM call to get the bounding box.
	//Unfortunately, there doesn't appear to be any clean way!
	
	//Do this part once, the creating a DOM element and adding it to document
	var el1 =  document.createElement("div");
	document.body.appendChild(el1); //only need to append once then reuse
	
//== elem1 box 1 text 1 --> text1_1_1
	var text1_1_1 = new Surface({
	  size: [true, true],
      content: "properties",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'hand'
      }
	});
	
	//now set the SVG text string -- from this point down can be repeated 
	// for multiple strings without removing or re-adding the element, nor
	// fiddling with the DOM
	var text1_1_1_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_1_1.content + '</text> </svg>';
	//note that id is inside the text element! Also the fill and stroke are
	// null so that nothing paints
	el1.innerHTML = text1_1_1_SVG; 

	//get the element -- this seems to be what triggers the bounding box calc
	var gottenElem = document.getElementById("svgText"); //use ID of the text elem

	//get the box, take the values out of it, and display them
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText width: " + rect.width + " right: " + rect.right);
	
	var retText1_1_1 = {
		ID: "retText1_1_1",
		width: rect.width,
		height: rect.height,
		shape: text1_1_1_SVG
	}
	
	var text1_1_2 = new Surface({
	  size: [true, true],
      content: "portsIn",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'pointer'
      }
	});	
	//repeat for the next text surface
	var text1_1_2_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_1_2.content + '</text> </svg>';
	el1.innerHTML = text1_1_2_SVG; 
	var gottenElem = document.getElementById("svgText");
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);
	
	var retText1_1_2 = {
		ID: "retText1_1_2",
		width: rect.width,
		height: rect.height,
		shape: text1_1_2_SVG
	}
	
	var text1_1_3 = new Surface({
	  size: [true, true],
      content: "portsOut",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'pointer'
      }
	});
	//repeat for the next text surface
	var text1_1_3_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_1_3.content + '</text> </svg>';
	el1.innerHTML = text1_1_3_SVG; 
	var gottenElem = document.getElementById("svgText");
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);
	
	var retText1_1_3 = {
		ID: "retText1_1_3",
		width: rect.width,
		height: rect.height,
		shape: text1_1_3_SVG
	}
	
	var text1_1_4 = new Surface({
	  size: [true, true],
      content: "subElems",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'pointer'
     }
	});
	//repeat for the next text surface
	var text1_1_4_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_1_4.content + '</text> </svg>';
	el1.innerHTML = text1_1_4_SVG; 
	var gottenElem = document.getElementById("svgText");
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);
	
	var retText1_1_4 = {
		ID: "retText1_1_4",
		width: rect.width,
		height: rect.height,
		shape: text1_1_4_SVG
	}
	
	
//== elem 1 box 1 text 1 mod 1 -> textMod1_1_1_1
	var text1_1_1x = 8;
	var text1_1_1y = 8;
	var textMod1_1_1_1 = new StateModifier({
        transform: Transform.translate(text1_1_1x, text1_1_1y, 0)
    });
	retText1_1_1.x = 8; retText1_1_1.y = 8; //subtract box x & y
	var textMod1_1_2_1 = new StateModifier({
        transform: Transform.translate(8, 25, 0)
    });
	retText1_1_2.x = 8; retText1_1_2.y = 23; //subtract box x & y
	var textMod1_1_3_1 = new StateModifier({
        transform: Transform.translate(8, 42, 0)
    });
	retText1_1_3.x = 8; retText1_1_3.y = 40; //subtract box x & y
	var textMod1_1_4_1 = new StateModifier({
        transform: Transform.translate(8, 59, 0)
    });
	retText1_1_4.x = 8; retText1_1_4.y = 57; //subtract box x & y
//==
	elem1Container.add(boxMod1_1_1).add(box1_1);
	elem1Container.add(textMod1_1_1_1).add(text1_1_1);
	elem1Container.add(textMod1_1_2_1).add(text1_1_2);
	elem1Container.add(textMod1_1_3_1).add(text1_1_3);
	elem1Container.add(textMod1_1_4_1).add(text1_1_4);

//== elem 1 box 2 --> box1_2
//	1:width 2:height 3:x 4:y 5:rx 6:ry 7:width 8:height 9:fill 10:stroke
//  11:stroke-width 12:opacity
	var box1_2w = 183; var box1_2h = 69; var box1_2pad = 2;
	var boxSVGFromParts1_2 = boxSVG[1] + (box1_2w + box1_2pad) + boxSVG[2] + (box1_2h + box1_2pad) + boxSVG[3] + '1' + boxSVG[4] + '1' + boxSVG[5] + '20' + boxSVG[6] + '20' + boxSVG[7] + box1_2w + boxSVG[8] + box1_2h + boxSVG[9] + 'none' + boxSVG[10] + 'green' + boxSVG[11] + '2' + boxSVG[12] + '1' + boxSVG[13];
		
	var box1_2 = new Surface({
	  size: [true, true],
      content: boxSVGFromParts1_2
 	});
	var box1_2x = 100;
	var box1_2y = 2;
	var boxMod1_2_1 = new StateModifier({
        transform: Transform.translate(box1_2x, box1_2y, 0)
    });
	var retPropertiesBox = {
		ID: "retPropertiesBox",
		x: box1_2x,
		y: box1_2y,
		width: box1_2w + box1_2pad, //think should be 2*pad!
		height: box1_2h + box1_2pad,
		shape: boxSVGFromParts1_2
	}

//== elem 1 box 2 text 1 --> text1_2_1
	var text1_2_1 = new Surface({
	  size: [true, true],
      content: "propertyName:  TypeOfElement",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'pointer'
      }
	});
	//repeat for the next text surface
	var text1_2_1_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_2_1.content + '</text> </svg>';
	el1.innerHTML = text1_2_1_SVG; 
	var gottenElem = document.getElementById("svgText");
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);	
	var retText1_2_1 = {
		ID: "retText1_2_1",
		width: rect.width,
		height: rect.height,
		shape: text1_2_1_SVG
	}
	
	
	var text1_2_2 = new Surface({
	  size: [true, true],
      content: "propertyValue:  GabeTransformRule",
      properties: {
        color: 'black',
        textAlign: 'left',
        fontSize: '11px',
        cursor: 'pointer'
      }
	});
	//repeat for the next text surface
	var text1_2_2_SVG = '<svg>  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + text1_2_2.content + '</text> </svg>';
	el1.innerHTML = text1_2_2_SVG; 
//	document.body.appendChild(el1);
	var gottenElem = document.getElementById("svgText");
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);	
	var retText1_2_2 = {
		ID: "retText1_2_2",
		width: rect.width,
		height: rect.height,
		shape: text1_2_2_SVG
	}

	//repeat for the next text surface
	var text1_2_3_SVG = '<svg id="svgTextHolder">  <text x="0" y="9" style="font-family: Arial; font-size: 11;fill:black;stroke:none" id="svgText">' + 'subProperties' + '</text> </svg>';
	el1.innerHTML = text1_2_3_SVG; 
//	document.body.appendChild(el1);
	var gottenElem = document.getElementById("svgText");
//	gottenElem.parentNode.replaceChild(el1, el1); 
	
    var rect = gottenElem.getBoundingClientRect();
	console.log("svgText: " + gottenElem.textContent + " width: " + rect.width + " right: " + rect.right);	
	var retText1_2_3 = {
		ID: "retText1_2_3",
		width: rect.width,
		height: rect.height,
		shape: text1_2_3_SVG
	}
	var text1_2_3 = new Surface({
	  size: [rect.width, rect.height],
      content: text1_2_3_SVG
	});

//==
	var textMod1_2_1_1 = new StateModifier({
        transform: Transform.translate(108, 8, 0)
    });
	retText1_2_1.x = 8; retText1_2_1.y = 6; //subtract box x & y
	var textMod1_2_2_1 = new StateModifier({
        transform: Transform.translate(108, 25, 0)
    });
	retText1_2_2.x = 8; retText1_2_2.y = 23; //subtract box x & y
	var textMod1_2_3_1 = new StateModifier({
        transform: Transform.translate(108, 42, 0)
    });
	retText1_2_3.x = 8; retText1_2_3.y = 40; //subtract box x & y
//==
	elem1Container.add(boxMod1_2_1).add(box1_2);
	elem1Container.add(textMod1_2_1_1).add(text1_2_1);
	elem1Container.add(textMod1_2_2_1).add(text1_2_2);
	elem1Container.add(textMod1_2_3_1).add(text1_2_3);

//Now, add bezier curve, in SVG..
//One end point is the end of "properties" text surface inside the elem box
//Other end point is the middle of side of properties box
	var bezSVG = [];
	bezSVG[1] = '<svg width="'
	bezSVG[2] = '" height="'
	bezSVG[3] = '"><path d="M' //start pt x
	bezSVG[4] = ','  //start pt y
	bezSVG[5] = ' C' //control pt 1 x
	bezSVG[6] = ','  //control pt 1 y
	bezSVG[7] = ' '  //control pt 2 x
	bezSVG[8] = ','  //control pt 2 y
	bezSVG[9] = ' '  //end pt x
	bezSVG[10] = ',' //end pt y
	bezSVG[11] = '" style="fill:'
	bezSVG[12] = ';stroke:'
	bezSVG[13] = ';stroke-width:'
	bezSVG[14] = ';opacity:'
	bezSVG[15] = '" vector-effect="non-scaling-stroke">';
	
	//now calculate the end points of the curve -- they connect to the
	// right edge of the "properties" text in the left box, and to the
	// middle of the left side of the right box
	var bezPoints = [{},{}];
	var bezOrigin = {
		x: box1_1x + retText1_1_1.width + retText1_1_1.x,
		y: text1_1_1y + retText1_1_1.height/2 + 3
	}
	bezPoints[0].x = 0;
	bezPoints[0].y = 0;
	bezPoints[1].x = box1_2x - bezOrigin.x;
	bezPoints[1].y = box1_2y + (box1_2h+box1_2pad)/2 - bezOrigin.y;

	var controlPoints = [];
	controlPoints[0] = {x:bezPoints[1].x, y:bezPoints[0].y};
	controlPoints[1] = {x:bezPoints[0].x, y:bezPoints[1].y};


	//	1:width 2:height 3:st x 4:st y 5:c1 x 6:c1 y 7:c2 x 8:c2 y 9: end x
	// 10: end y 11:fill 12:stroke 13:stroke-width 14:opacity
	var bezWidth = (bezPoints[1].x - bezPoints[0].x + 4); //add 2x stroke 
	var bezHeight = (bezPoints[1].y - bezPoints[0].y + 4); //add 2x stroke
	console.log("bez width: " + bezWidth + " and height: " + bezHeight);
	var bezSVG1 = "";
	bezSVG1 += bezSVG[1] + bezWidth;
	bezSVG1 += bezSVG[2] + bezHeight;
	bezSVG1 += bezSVG[3] + (bezPoints[0].x + 2); //move by stroke width
	bezSVG1 += bezSVG[4] + (bezPoints[0].y + 2); //move by stroke width
	bezSVG1 += bezSVG[5] + controlPoints[0].x;
	bezSVG1 += bezSVG[6] + controlPoints[0].y;
	bezSVG1 += bezSVG[7] + controlPoints[1].x;
	bezSVG1 += bezSVG[8] + controlPoints[1].y;
	bezSVG1 += bezSVG[9] + bezPoints[1].x; 
	bezSVG1 += bezSVG[10] + bezPoints[1].y; 
	bezSVG1 += bezSVG[11] + 'none' + bezSVG[12] + 'black' + bezSVG[13] + '2' + bezSVG[14] + '1' + bezSVG[15];
	
	var bez1_1 = new Surface({
	  size: [true, true],
      content: bezSVG1
 	});
	var bezMod = new StateModifier({
        transform: Transform.translate(bezOrigin.x, bezOrigin.y, 0)
    });

	elem1Container.add(bezMod).add(bez1_1);
	
	var retBezier = {
		ID: "bezier",
		x: bezOrigin.x,
		y: bezOrigin.y,
		width: bezWidth,
		height: bezHeight,
		shape: bezSVG1
	}

//for some reason, the way use el1 above makes the DOM stop rendering
// So, in order to get these other elements to render, first remove
// the element that have been using to calc bounding box sizes..
var elToRemove = document.getElementById("svgText");
elToRemove.parentNode.parentNode.removeChild(elToRemove.parentNode);

//okay, now new DOM elements will render
var el2 =  document.createElement("span")
var displayStr = bezSVG1.replace(/</g, "&lt");//make the html display as text
el2.innerHTML = (displayStr + "<br>");
//document.body.appendChild(el2);
console.log("bez svg: " + bezSVG1);

//== elem 1 Modifer 1 --> contMod1_1
	var contMod1_1 = new StateModifier({
        transform: Transform.translate(50, 50, 0)
    });
	var contMod1_2 = new StateModifier({
		transform: Transform.scale(1, 1)
    });	
//==

	//cause this all to be painted, by adding to the main context
//	mainContext.add(contMod1_1).add(contMod1_2).add(elem1Container);
	
	return {
		getRootBox: retRootBox,
		getElemBox: retElemBox,
		getText1_1_1: retText1_1_1,
		getText1_1_2: retText1_1_2,
		getText1_1_3: retText1_1_3,
		getText1_1_4: retText1_1_4,
		getPropertiesBox: retPropertiesBox,
		getText1_2_1: retText1_2_1,
		getText1_2_2: retText1_2_2,
		getText1_2_3: retText1_2_3,
		getBezier: retBezier
	}
});
