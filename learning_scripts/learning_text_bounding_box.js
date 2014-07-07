
	//Do this part once, of creating a DOM element and adding it to document
	var el1 =  document.createElement("div");
	document.body.appendChild(el1); //only need to append once then reuse
	
	//now set the SVG text string -- from this point down can be repeated 
	// for multiple strings without removing or re-adding the element, nor
	// fiddling with the DOM
	var text1_1_1_SVG = '<svg>  <text x="0" y="0" style="font-family: Arial; font-size: 12;fill:none;stroke:none" id="svgText1">' + text1_1_1.content + '</text> </svg>';
	//note the id is inside the text element! Also the fill and stroke are
	// null so nothing paints
	el1.innerHTML = text1_1_1_SVG; 

	//get the element -- this seems to be what triggers the bounding box calc
	var test = document.getElementById("svgText1"); //use ID of the text elem

	//get the box, take the values out of it, and display them
    var rect = test.getBoundingClientRect();
	var str = "";
	for (i in rect) { //a trick for getting all the attributes of the object
		str += i + " = " + rect[i] + "  ";
	}
	console.log("svgText1: " + str);
		
	var el2 =  document.createElement("span");
	el2.style.display="block";
	el2.id="testing123";
	el2.style.width="10%";
	el2.innerHTML = text1_1_1.content;
	document.body.appendChild(el2);
	console.log("testing123 class " + el2.className);
	
	
	var test = document.getElementById("test12");
    var rect = test.getBoundingClientRect();
	var str = "";
	for (i in rect) {
		str += i + " = " + rect[i] + "<br>";
	}
	console.log("test12: " + str);

//	var svgTextElem = new SVGTextElement();
	
	var elem = document.getElementById("svg_text");
	var foo = elem.getBBox();
	console.log("svg_text getBBox: " + foo.width);
//	console.log("svg_text computed: " + elem.getComputedTextLength());
	console.log("svg_text foo: " + elem.childNodes[1].className);
	console.log("svg_text class: " + elem.className);
	
	
	var f = document.getElementById("svg_text").getClientRects();
	console.log("svg_text getClientRects: " + f[0].width);
	
	var rect = document.getElementById("testing123").getBoundingClientRect();
	console.log("getBoundingClientRect: " + rect.width);
	
	function getText1_1_1() {
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
//	document.body.removeChild(el1);
	var text1_1_2_SVG = '<svg> <text id="svgText2" x="0" y="0" style="font-family: Arial; font-size: 12;fill:none;stroke:none">' + text1_1_2.content + '</text> </svg>';
	el1.innerHTML = text1_1_2_SVG;
//	document.body.appendChild(el1);
	
	var test = document.getElementById("svgText2");
    var rect = test.getBoundingClientRect();
	var str = "";
	for (i in rect) {
		str += i + " = " + rect[i] + "<br>";
	}
	console.log("svgText2: " + str);
	console.log("svgText2: " + test.getComputedTextLength());
	
