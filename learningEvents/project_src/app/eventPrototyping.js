

define(function(require, exports, module) {

	var msgEl =  document.createElement("div");
	msgEl.id = "msgEl";
	document.body.appendChild(msgEl); //only need to append once then reuse
	
	function clickHandler(e) {
		var msg = "event: " + e.type + " target: " + e.origin.id;
		msgEl.innerHTML = msg;
		console.log(msg);
	}
	function keydownHdlr(e) {
		var msg = "event: " + e.type + ' keyCode=' + e.keyCode;
		msgEl.innerHTML = msg;
		console.log(msg);
	}

	
var svgMouseEnter = function(e) {
	var msg =  "mouse enter SVG";
	console.log(msg);
	var test = document.getElementById("msgEl"); 
	test.innerHTML = msg;
}

var svgMouseOut = function(e) {
	var msg =  "mouse exit SVG";
	console.log(msg);
	var test = document.getElementById("msgEl"); 
	test.innerHTML = msg;
}
var animate=function(obj){
   obj.x.baseVal.value+=1;
   obj.y.baseVal.value+=1;
}

		
//===========================
       document.addEventListener("keydown",keydownHdlr,false);
//       document.addEventListener("keypress",keypress,false);
//       document.addEventListener("keyup",keyup,false);
//       document.addEventListener("textInput",textinput,false);



//===========================
/*
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
*/

//===========================
var svgRoot = document.getElementById("svgRoot"); 

var NS="http://www.w3.org/2000/svg";
var svgEl = document.createElementNS(NS,"svg");
var rect=function(h,w,fill){
   var NS="http://www.w3.org/2000/svg";
   var SVGObj= document.createElementNS(NS,"rect");
   SVGObj.width.baseVal.value=w;
   SVGObj.height.baseVal.value=h;
   SVGObj.x.baseVal.value=0;
   SVGObj.y.baseVal.value=0;
   SVGObj.style.fill=fill;
   SVGObj.onmouseenter=svgMouseEnter;
   SVGObj.onmouseout=svgMouseOut;
   return SVGObj;
}
var r= rect(20,20,"blue");
r.setAttribute('transform', "translate(300, 200)");
r.setAttribute('transform', "scale(6)");
//	r.setAttribute('transform','translate(60,-30)');
//	r.transform.baseVal.getItem(0).setTranslate(30,100);

svgRoot.appendChild( r );

//	r.x.baseVal.value=100;
var animate=function(){
   r.x.baseVal.value+=5;
   r.y.baseVal.value+=5;
   console.log("moving..");
}
//var timer = setInterval( function(){animate();},500);
//setTimeout( function(){clearInterval(timer);}, 2000);


var sigmaSVG = '<svg width="744.09448" height="1052.3622" id="svg2"> <g id="g3759"> <path  d="m 188.70968,122.10412 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,31.81771 -0.47557,0.69813 38.70968,32.25806" id="path2985" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 188.70968,184.36218 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,-31.81771 -0.47557,-0.69813 38.70968,-32.25806" id="path3757" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </g> </svg>';

var sigmaSVG1 = '<g id="g3759"> <path  d="m 188.70968,122.10412 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,31.81771 -0.47557,0.69813 38.70968,32.25806" id="path2985" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> <path d="m 188.70968,184.36218 c -46.7742,0 -48.3871,0 -48.3871,0 39.47543,-31.81771 -0.47557,-0.69813 38.70968,-32.25806" id="path3757" style="fill:none;stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /> </g>';

//	test.append(sigmaSVG);

/*
var parser = new DOMParser();
var svgDOM = parser.parseFromString(sigmaSVG, "text/xml");
svgRoot.appendChild(svgDOM.documentElement);
*/

//   drawSVG(sigmaSVG1);
var svgEl = document.createElementNS(NS,"svg");
svgEl.innerHTML = sigmaSVG1;
svgRoot.appendChild( svgEl );
svgEl.onmouseenter=svgMouseEnter;
svgEl.onmouseout=svgMouseOut;

var svgText = '<text x="0" y="12" style="font-family: Arial; font-size: 12;fill:none;stroke:green" onclick=svghandler id="svgText1">svg text for event</text>';

var svgEl_1 = document.createElementNS(NS,"svg");
svgEl_1.innerHTML = svgText;
svgRoot.appendChild( svgEl_1 );
svgEl_1.x.baseVal.value = 50;
svgEl_1.y.baseVal.value = 5;
svgEl_1.onmouseenter=svgMouseEnter;
svgEl_1.onmouseout=svgMouseOut;

});
