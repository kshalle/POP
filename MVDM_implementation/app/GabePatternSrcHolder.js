

//Make a SrcHolder object
define( function( require, exports, module ) {

var visualizer  = require('./POPSyntaxGraphVisualizer');
var commander   = require('./POPSyntaxGraphCommander');
var modifier    = require('./POPSyntaxGraphModifier');	
var syntaxGraph = require('./buildGabePatternSyntaxGraph');

//The src holder has to serialize the syntax graph out to persistent
// storage, and bring it back in, converting back to javascript objects
//JSON can stringify and then parse back, but it can't handle circuits
// in the graph, so have to write code that crawls the graph and
// individually stringifies each element
//So, the steps:
//-] crawl only the elements.  
//-] An element has properties, ports, and linked elements attached..
//- -] properties are fine as-is, the stringify will handle them
//- -] ports have pointers back to the element, so those must be replaced
//     with the element's ID before stringify
//- -] linked elements can potentially link back around in a 
//     circle, so replace those links with IDs before stringify
//
//-] start at root, get the first element.
//-] For a given element:
//- -] check whether marked as already visited if yes, return, else
//     continue
//- -] mark the element as having been visited
//- -] visit each port (save this position before visiting!), and 
//     for a given port:
//- - -] follow each pairedPort link, and process element linked to the 
//       paired port
//- - -] when come back, replace pairedPort pointer with ID of the
//       pointed-to port
//- -] for each element in the array of linked elements:
//- - -] visit and process the element linked to (save position first)
//- - -] when come back, replace the pointer with ID of the linked elem
//- -] when all the elment's ports and linked elems have been visited, 
//     return to the position were in just before visiting this element
//-] when no where to return to, then done! 
var persistTheGraph = function( theGraphRoot ) {
    var shadowGraphRoot = { rootElem, rootViewSet };
    var shadowRootElem = { portsIn: [], portsOut: [], linkedElems: [] };
    var shadowRootViewSet = { syntaxElem: {}, elemViewTree: {}, viewSetLinks: [] };
    shadowGraphRoot.rootElem = shadowRootElem;
    shadowGraphRoot.rootViewSet = shadowRootViewSet;

	startPersisting(); //send notice to web server that persist protocol is starting
    //save out the top level object that has the handles to the view hierarchy root
    // and the root element.  Also persist the view hierarchy root because it doesn't
    // fit cleanly to try to reach it from the root element..  by persisting it here,
    // can then do a single recursive call and only pass the next syntax element to
    // clean up.  Any view stuff will be reached from that element
    var rootElem = theGraphRoot.rootElem; //save 'cause pointers about to be replaced
    persistGraphRootAndViewSetRoot( theGraphRoot, shadowGraphRoot );
	visitNextElemAndPersistIt( rootElem, shadowRootElem );
	endPersisting();   //tell web server that persist protocol ended
	
    //The graph has been stringified, all done, so now replace the pointers!
//    visitNextElemAndReplacePointers( rootElem, shadowRootElem );
}

function persistGraphRootAndViewSetRoot( theGraphRoot, shadowGraphRoot ) {
    //just save the stuff that's above the root elem..
    // so, cut off pointers to anything below so JSON can stringify
    shadowGraphRoot.rootViewSet.elemViewTree = theGraphRoot.rootViewSet.elemViewTree;
    theGraphRoot.rootViewSet.elemViewTree = theGraphRoot.rootViewSet.elemViewTree.ID;

    //should only be one view set link, that points to the view set of the root element
    shadowGraphRoot.rootViewSet.viewSetLinks[0] = theGraphRoot.rootViewSet.viewSetLinks[0];
    theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet =
        theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet.ID;

    //the root view set has an undefined pointer-to-element
//    shadowGraphRoot.rootViewSet.syntaxElem = theGraphRoot.rootViewSet.syntaxElem;
//    theGraphRoot.rootViewSet.syntaxElem = theGraphRoot.rootViewSet.syntaxElem.ID;

    //now safe to be stringified with JSON..  so do it!
    var stringOfGraphRoot = JSON.stringify( theGraphRoot );
    console.log("JSON of graphRoot: " + stringOfGraphRoot );
    persistString( stringOfGraphRoot )
}

//Contract: have already verified that this elem has not been visited before calling
var visitNextElemAndPersistIt = function( elem, shadowElem ) {
	//mark the element as having been visited
	elem.isAlreadyVisited = true;
	
	//visit each port (save this position before visiting!)
    var elemToVisit = {}; var i = 0; var j = 0; var inPort = {};
    var ports = elem.portsIn; var numPorts = ports.length; var numPairedPorts = 0;
	//as go along, save pointers into shadow element..
    for( j = 0; j < numPorts; j++ ) {
        inPort = ports[j];
        numPairedPorts = inPort.pairedPorts.length;
		   //shadowElem may not have enough positions in portsIn array..
        shadowElem.portsIn.push({pairedPorts: []});
        //follow each pairedPort link
        for( i = 0; i < numPairedPorts; i++ ) {
            //process element linked to the paired port
            elemToVisit = inPort.pairedPorts[i].element;
            if( !elemToVisit.isAlreadyVisited ) {
				//not visited yet, so doesn't have a shadow elem
                var newShadowElem = { portsIn: [], portsOut: [], linkedElems: [] };
                shadowElem.portsIn[j].pairedPorts.push(newShadowElem);
                visitNextElemAndPersistIt(elemToVisit, newShadowElem );
            }
            //back from visit, replace pointer with ID of pointed to port
            shadowElem.portsIn[j].pairedPorts[i] = inPort.pairedPorts[i]; //first save it!
            inPort.pairedPorts[i] = inPort.pairedPorts[i].ID;
        }
		//save and replace the element back-pointer in the port object
		shadowElem.portsIn[j].element = inPort.element;
		inPort.element = inPort.element.ID;
    }
    ports = elem.portsOut; numPorts = ports.length; var outPort = {};
    for( j = 0; j < numPorts; j++ ) {
        outPort = ports[j];
        numPairedPorts = outPort.pairedPorts.length;
        shadowElem.portsOut.push({pairedPorts: []});
        //follow each pairedPort link
        for( i = 0; i < numPairedPorts; i++ ) {
            //process element linked to the paired port
            elemToVisit = outPort.pairedPorts[i].element;
            if( !elemToVisit.isAlreadyVisited ) {
                var newShadowElem = { portsIn: [], portsOut: [], linkedElems: [] };
                shadowElem.portsOut[j].pairedPorts.push(newShadowElem);
                visitNextElemAndPersistIt(elemToVisit, newShadowElem );
            }
            //when come back, replace pointer with ID of pointed to port
            outPort.pairedPorts[i] = outPort.pairedPorts[i].ID;
        }
		//save and replace the element back-pointer in the port object
		shadowElem.portsOut[j].element = outPort.element;
		outPort.element = outPort.element.ID;
    }
    var numLinkedElems = elem.linkedElems.length;
    for( i = 0; i < numLinkedElems; i++ ) {
        if( !(elem.linkedElems[i].isAlreadyVisited) ) {
            var newShadowElem = { portsIn: [], portsOut: [], linkedElems: [] };
            shadowElem.linkedElems.push(newShadowElem);
            visitNextElemAndPersistIt(elem.linkedElems[i], newShadowElem );
        }
        //back from visit, replace pointer with ID of pointed to elem
        shadowElem.linkedElems[i] = elem.linkedElems[i];
        elem.linkedElems[i] = elem.linkedElems[i].ID;
    }

    //now cut off view set from other view sets

    //this elem, and all objects reachable from it are now safe to be
    // stringified with JSON..  so do it!
    var stringOfElemNode = JSON.stringify( elem );
	console.log("JSON of elem: " + stringOfElemNode );
    persistString( stringOfElemNode );
}

persistTheGraph( syntaxGraph.rootElem );

//persistString("JSON persisted from srcHolder " + Math.random() );
//retrievePersistedString();

function startPersisting() {
	//bottle server
	var theUrl = "http://localhost:8080/startsavinggraph";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("started persisting: " + xmlHttp.responseText );
}

function persistString( stringToWrite ) {
	//bottle server
	var theUrl = "http://localhost:8080/save1elem/" + stringToWrite;
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("response to the write: " + xmlHttp.responseText );
}

function endPersisting() {
	//bottle server
	var theUrl = "http://localhost:8080/endsavinggraph";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("started persisting: " + xmlHttp.responseText );
}

//================================

function startRetrieve() {
	var theUrl = "http://localhost:8080/startretrievinggraph";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("started retrieve: " + xmlHttp.responseText );
}

function retrieveNextPersistedString() {
	var theUrl = "http://localhost:8080/get1elem";
    var xmlHttp = null;
	
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("retrieved string: " + xmlHttp.responseText );
}

function endRetrieve() {
	var theUrl = "http://localhost:8080/endretrievinggraph";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    console.log("end retrieve: " + xmlHttp.responseText );
}

//=================================

return{
	visualizer:  visualizer,
	commander:   commander,
	modifier:    modifier,
	syntaxGraph: syntaxGraph
};
});


