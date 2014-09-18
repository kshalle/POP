

define(function(require, exports, module) {
    var Engine           = require("famous/core/Engine");
    var Surface          = require("famous/core/Surface");
    var Modifier         = require("famous/core/Modifier");
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Scrollview       = require("famous/views/Scrollview");

    var mainContext = Engine.createContext();

	var msgEl =  document.createElement("div");
	msgEl.id = "msgEl";
	document.body.appendChild(msgEl); //only need to append once then reuse
	
	function clickHandler(e) {
		var msg = "event: " + e.type + " target: " + e.origin.id;
		msgEl.innerHTML = msg;
		console.log(msg);
	}
	function keydownHdlr(e) {
		var msg = "event: " + e.type + ' keyCode=' + keyval(e.keyCode);
		msgEl.innerHTML = msg;
		console.log(msg);
	}

		
//===========================
       document.addEventListener("keydown",keydownHdlr,false);
//       document.addEventListener("keypress",keypress,false);
//       document.addEventListener("keyup",keyup,false);
//       document.addEventListener("textInput",textinput,false);



//===========================
	var el1 =  document.createElement("div");
	document.body.appendChild(el1); //only need to append once then reuse
	
	//now set the SVG text string -- from this point down can be repeated 
	// for multiple strings without removing or re-adding the element, nor
	// fiddling with the DOM
	var text1_1_1_SVG = '<svg>  <text x="0" y="12" style="font-family: Arial; font-size: 12;fill:none;stroke:green" onclick=svghandler id="svgText1">svg text for event</text> </svg>';
	//note the id is inside the text element! Also the fill and stroke are
	// null so nothing paints
	el1.innerHTML = text1_1_1_SVG; 

	//get the element -- this seems to be what triggers the bounding box calc
	var test = document.getElementById("svgText1"); //use ID of the text elem
//    test.addEventListener("keydown",keydown,false);

	//get the box, take the values out of it, and display them
    var rect = test.getBoundingClientRect();
	var str = "";
	for (i in rect) { //a trick for getting all the attributes of the object
		str += i + " = " + rect[i] + "  ";
	}
	console.log("svgText1: " + str);

	el1.addEventListener("mouseover", 
		function(e) {
//		msgEl.innerHTML = "mouse enter: " + e.charcode; 
		console.log("svg text mouse enter: "+e.type + " target: "+e)});
		
	el1.addEventListener("mouseout", 
		function(e) {
		console.log("svg text mouse out: "+e.type + " target: "+e);
//		msgEl.innerHTML = "key down: " + e.charcode; 
		});
//	el1.addEventListener("click", 
//		function(e) {
//		console.log("key press: "+e.type + " target: "+e);
//		msgEl.innerHTML = "key press: " + e.charcode; 
//		});

//===========================

/*
	var NS="http://www.w3.org/2000/svg";
	var svgEl = document.createElementNS(NS,"svg");
	document.body.appendChild( svgEl );
	var rect=function(h,w,fill){
		var NS="http://www.w3.org/2000/svg";
		var SVGObj= document.createElementNS(NS,"rect");
		SVGObj.width.baseVal.value=w;
		SVGObj.height.baseVal.value=h;
		SVGObj.setAttribute("height",h);
		SVGObj.style.fill=fill;
		return SVGObj;
	}
	var r= rect(100,100,"blue");
	svgEl.appendChild(r);
*/

	var el4 =  document.createElement("script");
	var overHdlr = function(e) {
		var msg = "mouse over ele3: " + e.type + " target: " + e.currentTarget.viewBox.ID;
		console.log(msg);
		msgEl.innerHTML = msg; 
	}
	var boxSVG = '<svg width="55" height="55"> <rect x="3" y="3" rx="20" ry="20" width="50" height="50" id="svgBox2" onmouseover="svghandler()" style="fill:red;stroke:black;stroke-width:3;opacity:0.5">';
	var el3 =  document.createElement("div");
	el3.viewBox = {
		ID: 10
	}
	el3.innerHTML = boxSVG;

/*	
	el3.addEventListener("mouseover", 
		function(e) {
		var msg = "mouse over ele3: "+e.type + " target: "+e.currentTarget.viewBox.ID;
		console.log(msg);
		msgEl.innerHTML = msg; 
		});

	el3.addEventListener("mouseout", 
		function(e) {
		var msg = "mouse left ele3: "+e.type + " target: "+e.currentTarget.viewBox.ID;
//		console.log("svg text mouse out: "+e.type + " target: "+e);
		msgEl.innerHTML = msg; 
		});
*/
	document.body.appendChild(el3);

   	var test = document.getElementById("svgBox1"); 
	test.addEventListener("mouseover", 
		function(e) {
		var msg = "mouse enter svg box: "+e.type + " target: "+ e.viewBox;
		console.log(msg);
		msgEl.innerHTML = msg; 
		});
	test.addEventListener("mouseout", 
		function(e) {
		var msg = "mouse exit svg box: "+e.type + " target: "+e;
		console.log(msg);
		msgEl.innerHTML = msg; 
		});

	var mySurface = new Surface({
	  size: [true, true],
      content: boxSVG,
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});
	var mySurface2 = new Surface({
	  size: [true, true],
      content: boxSVG,
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});
	var sigmaSVG = '<svg width="744.09448" height="1052.3622" id="svg2"> <g id="g3759"> <path  d="m 188.70968,122.10412 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,31.81771 -0.47557,0.69813 38.70968,32.25806" id="path2985" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 188.70968,184.36218 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,-31.81771 -0.47557,-0.69813 38.70968,-32.25806" id="path3757" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </g> </svg>';
	
	var sigmaSurf = new Surface({
	  size: [100, 100],
      content: sigmaSVG,
      properties: {
        color: 'black',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});
	
	mySurface.on('mouseover', clickHandler);
	mySurface.on('mouseout', clickHandler);
	sigmaSurf.on('mouseover', clickHandler);
	sigmaSurf.on('mouseout', clickHandler);
	mySurface2.on('mouseover', clickHandler);
	mySurface2.on('mouseout', clickHandler);

	var moveModifier1 = new StateModifier({
        transform: Transform.translate(250, 100, 0)
    });
	var moveModifier2 = new StateModifier({
        transform: Transform.translate(350, 150, 0)
    });
	var rotateModifier = new StateModifier({
		transform: Transform.rotateZ(Math.PI/4)
	});

//the origin is the point inside the child, relative to the child's
// internal axes, at which the child will be pinned inside its parent.
//The align is the point inside the parent, relative to the parent's axes,
// at which the origins of children will be pinned.
//The origin is also the point about which rotations are performed
	var moveRelativeModifier = new StateModifier({
      size: [20, 20],
      align: [0.5,0],
      origin: [0.5,0]
    });
	var moveRelativeModifier2 = new StateModifier({
      size: [20, 20],
      align: [0.5,0],
      origin: [0.5,0]
    });

	var moveModifier2 = new StateModifier({
        transform: Transform.translate(350, 150, 0)
    });
	
    var scaleMod = new StateModifier({
        transform: Transform.scale(0.5, 0.5, 1)
    });


//can make a tree inside the context -- so, can have a transform applied
// to multiple children..  do so by making a var that holds the transform
// node, then add to that variable multiple times.
//Note, though that a given surface object will only render once!  Have to
// clone it if want multiple versions to be drawn.
//Same goes for modifiers -- cannot put same modifier object at multiple 
// places within tree -- it will only render children of ONE of those places!
   var node = mainContext.add(rotateModifier);
   node.add(moveModifier2).add(moveRelativeModifier).add(mySurface);
   node.add(moveModifier1).add(scaleMod).add(mySurface2);
   mainContext.add(moveRelativeModifier2).add(sigmaSurf);

	//========== copy-pasted scrollview example stuff below this ==========
	var container = new ContainerSurface(
	 {
		size: [400, 400],
		properties: 
		 {
			overflow: 'hidden'
		 }
	 });
	
	var surfaces = [];
	//create a thing that is able to transition between surfaces.. the 
	// surface that transitions in is the new one that is seeable on screen.
	var scrollview = new Scrollview();
	
	//create the renderable surfaces, each is capable of being seeable on screen
	var temp;
	/*
	for (var i = 0; i < 5; i++) {
		temp = new Surface({
			size: [undefined, 50],
			content: 'I am surface: ' + (i + 1),
			classes: ['red-bg'],
			properties: {
				textAlign: 'center',
				lineHeight: '50px'
			}
		});
		temp.on('click', clickHandler);

		//put the surface into the scrollview management element
		temp.pipe(scrollview);
		//put the surface into an array of surfaces, for bookkeeping
		surfaces.push(temp);
	}
	*/

	//The scrollview is now loaded up with all the surfaces, so tell it how
	// want it to transition between the different surfaces
	scrollview.sequenceFrom(surfaces);
	
	//add the scrollview to the container..  the container defines size and
	// some other properties..
	container.add(scrollview);

	//make the container viewable, and hence the scrollview, hence whatever 
	// surface is loaded as the top in the scrollview
	mainContext.add(new Modifier({origin: [.5, .5]})).add(container);

});
