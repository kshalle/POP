

//Make a SrcHolder object
define( function( require, exports, module ) {

//bookkeeping, setup
var visualizer  = require('./POPSyntaxGraphVisualizer');
var commander   = require('./POPSyntaxGraphCommander');
var modifier    = require('./POPSyntaxGraphModifier');	
var syntaxGraph = require('./buildGabePatternSyntaxGraph');

var theObjColl = syntaxGraph.rootElem.prototype;

function ShadowGraphElem() {
    this.portsInShadows = [];
    this.portsOutShadows = [];
    this.portsIn = [];
    this.portsOut = [];
    this.linkedElems = [];
};
ShadowGraphElem.prototype = theObjColl;
ShadowGraphElem.prototype.constructor = ShadowGraphElem;

//==================================================
//==
//==================================================

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
    var shadowGraphRoot = { rootElem: {}, rootViewSet: {} };
    var shadowRootElem = new ShadowGraphElem();
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
    persistAnchorAndViewSetRoot( theGraphRoot, shadowGraphRoot );
	visitNextElemAndPersistIt( rootElem, shadowRootElem );
	endPersisting();   //tell web server that persist protocol ended

    //now, restore all the pointers, replacing the IDs with pointer to object
    restoreAnchorAndViewSetRoot( theGraphRoot, shadowGraphRoot );
    visitNextElemAndRestoreIt( rootElem, shadowRootElem );
}

function persistAnchorAndViewSetRoot( theGraphRoot, shadowGraphRoot ) {
    //save the top level root object and the top view set, which is above
    // the view set of the root element
    //Replace pointer to root elem with its ID and cut off pointers
    // inside the root view set link, so JSON stringify only gets the root
    // view set and its one view set link object
    shadowGraphRoot.rootElem = theGraphRoot.rootElem;
    theGraphRoot.rootElem = theGraphRoot.rootElem.ID;

    //remove the back link from the view set link back to the root view set
    shadowGraphRoot.backLinkToRootViewSet = theGraphRoot.rootViewSet.viewSetLinks[0].referenceViewSet;
    theGraphRoot.rootViewSet.viewSetLinks[0].referenceViewSet =
        theGraphRoot.rootViewSet.viewSetLinks[0].referenceViewSet.ID;

    //cut off the view set link, that points to the view set of the root element
    shadowGraphRoot.linkToRootElemsViewSet =
        theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet;
    theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet =
        theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet.ID;

    //Now, ready to go, stringify away!
    var stringOfGraphRoot = JSON.stringify( theGraphRoot, null, '\t' );
    console.log("JSON of graphRoot: " + stringOfGraphRoot );
    persistString( stringOfGraphRoot )
}

//Contract: have already verified that this elem has not been visited before calling
var visitNextElemAndPersistIt = function( elem, shadowElem ) {
	//mark the element as having been visited
	elem.isAlreadyVisited = true;

    //cut the back link going from the view set to the elem node
    if(elem.viewSet.syntaxElem) {
        shadowElem.viewSet.syntaxElem = elem.viewSet.syntaxElem;
        elem.viewSet.syntaxElem = elem.viewSet.syntaxElem.ID;
    }

	//visit each port (save this position before visiting!)
    var elemToVisit = {}; var i = 0; var j = 0; var inPort = {};
    var ports = elem.portsIn; var numPorts = ports.length; var numPairedPorts = 0;
	//as go along, save pointers into shadow element..
    for( j = 0; j < numPorts; j++ ) {
        inPort = ports[j];
        numPairedPorts = inPort.pairedPorts.length;
		   //shadowElem may not have enough positions in portsIn array..
//        shadowElem.portsIn.push({pairedPorts: []});
        //follow each pairedPort link
        for( i = 0; i < numPairedPorts; i++ ) {
            //process element linked to the paired port
            elemToVisit = inPort.pairedPorts[i].element;
            if( !elemToVisit.isAlreadyVisited ) {
				//not visited yet, so doesn't have a shadow elem
                var newShadowElem = new ShadowGraphElem();
//      fixthis          shadowElem.portsIn[j].pairedPortShadows[i] = newShadowElem;
                visitNextElemAndPersistIt(elemToVisit, newShadowElem );
            }
            //back from visit, replace pointer with ID of pointed to port
//            shadowElem.portsIn[j].pairedPorts[i] = inPort.pairedPorts[i]; //first save it!
            inPort.pairedPorts[i] = inPort.pairedPorts[i].ID;
        }
		//save and replace the element back-pointer in the port object
//		shadowElem.portsIn[j].element = inPort.element;
		inPort.element = inPort.element.ID;
    }
    ports = elem.portsOut; numPorts = ports.length; var outPort = {};
    for( j = 0; j < numPorts; j++ ) {
        outPort = ports[j];
        numPairedPorts = outPort.pairedPorts.length;
//        shadowElem.portsOut.push({pairedPorts: []});
        //follow each pairedPort link
        for( i = 0; i < numPairedPorts; i++ ) {
            //process element linked to the paired port
            elemToVisit = outPort.pairedPorts[i].element;
            if( !elemToVisit.isAlreadyVisited ) {
                var newShadowElem = new ShadowGraphElem();
//                shadowElem.portsOut[j].pairedPorts.push(newShadowElem);
                visitNextElemAndPersistIt(elemToVisit, newShadowElem );
            }
            //when come back, replace pointer with ID of pointed to port
            outPort.pairedPorts[i] = outPort.pairedPorts[i].ID;
        }
		//save and replace the element back-pointer in the port object
//		shadowElem.portsOut[j].element = outPort.element;
		outPort.element = outPort.element.ID;
    }
    var numLinkedElems = elem.linkedElems.length;
    for( i = 0; i < numLinkedElems; i++ ) {
        if( !(elem.linkedElems[i].isAlreadyVisited) ) {
            var newShadowElem = new ShadowGraphElem();
//            shadowElem.linkedElems.push(newShadowElem);
            visitNextElemAndPersistIt(elem.linkedElems[i], newShadowElem );
        }
        //back from visit, replace pointer with ID of pointed to elem
//        shadowElem.linkedElems[i] = elem.linkedElems[i];
        elem.linkedElems[i] = elem.linkedElems[i].ID;
    }

    //cut links to the view sets embedded within view set link objects
    if(elem.viewSet.viewSetLinks) {
        var viewSet = elem.viewSet;
        var numLinked = viewSet.viewSetLinks.length;
        var viewSetLink = {};
        for (i = 0; i < numLinked; i++) {
            viewSetLink = viewSet.viewSetLinks[i];
            if (viewSetLink) {
                var shadowLink = { referenceViewSet: {}, subordinateViewSet: {} };
//                shadowLink.referenceViewSet = viewSetLink.referenceViewSet;
//                shadowLink.subordinateViewSet = viewSetLink.subordinateViewSet;
                viewSetLink.referenceViewSet = viewSetLink.referenceViewSet.ID;
                viewSetLink.subordinateViewSet = viewSetLink.subordinateViewSet.ID;
            }
        }
    }
    //cut back-links to parent view boxes within view set tree
    if(elem.viewSet.rootViewBox) {
        walkViewTree( elem.viewSet.rootViewBox );
    }

    //this elem, and all objects reachable from it are now safe to be
    // stringified with JSON..  so do it!
    var stringOfElemNode = JSON.stringify( elem, null, '\t' );
	console.log("JSON of elem: " + stringOfElemNode );
    persistString( stringOfElemNode );
}

//now that the graph, with its view sets, has been written out to JSON,
// go back and restore the pointers, replacing the IDs with actual pointer.
function restoreAnchorAndViewSetRoot( theGraphRoot, shadowGraphRoot ) {
    //just copy the above code and reverse the direction of the assignments!
    theGraphRoot.rootElem = shadowGraphRoot.rootElem;

    //remove the back link from the view set link back to the root view set
    theGraphRoot.rootViewSet.viewSetLinks[0].referenceViewSet = shadowGraphRoot.backLinkToRootViewSet;

    //cut off the view set link, that points to the view set of the root element
    theGraphRoot.rootViewSet.viewSetLinks[0].subordinateViewSet = shadowGraphRoot.linkToRootElemsViewSet;
}

//Contract: have already verified that this elem has not been visited before calling
var visitNextElemAndRestoreIt = function( elem, shadowElem ) {
    //mark the element as having been visited
    elem.isAlreadyVisited = false;  //all start at true, making false marks as restored

    //restore the back link going from the view set to the elem node
    if(elem.viewSet.syntaxElem) {
        elem.viewSet.syntaxElem = elem.getById(elem.viewSet.syntaxElem);
    }

    //restore each port
    var elemToVisit = {}; var i = 0; var j = 0; var inPort = {};
    var ports = elem.portsIn; var numPorts = ports.length; var numPairedPorts = 0;
    //as go along, restore pointers from shadow element..
    for( j = 0; j < numPorts; j++ ) {
        inPort = ports[j];
        numPairedPorts = inPort.pairedPorts.length;
        //follow each pairedPort link
        //restore the element back-pointer in the port object
        inPort.element = shadowElem.portsIn[j].element;
        for( i = 0; i < numPairedPorts; i++ ) {
            //process element linked to the paired port
            //first, replace pointer to port
            inPort.pairedPorts[i] = shadowElem.portsIn[j].pairedPorts[i];
//verify this is right order -- do rest of restore on tis one before visit?
            elemToVisit = inPort.pairedPorts[i].element;
            if( elemToVisit.isAlreadyVisited ) { //if still marked from before
                visitNextElemAndPersistIt(elemToVisit, shadowElem.portsIn[j].pairedPorts[i] );
            }
        }
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

    //cut links to the view sets embedded within view set link objects
    if(elem.viewSet.viewSetLinks) {
        var viewSet = elem.viewSet;
        var numLinked = viewSet.viewSetLinks.length;
        var viewSetLink = {};
        for (i = 0; i < numLinked; i++) {
            viewSetLink = viewSet.viewSetLinks[i];
            if (viewSetLink) {
                var shadowLink = { referenceViewSet: {}, subordinateViewSet: {} };
                shadowLink.referenceViewSet = viewSetLink.referenceViewSet;
                shadowLink.subordinateViewSet = viewSetLink.subordinateViewSet;
                viewSetLink.referenceViewSet = viewSetLink.referenceViewSet.ID;
                viewSetLink.subordinateViewSet = viewSetLink.subordinateViewSet.ID;
            }
        }
    }
    //cut back-links to parent view boxes within view set tree
    if(elem.viewSet.rootViewBox) {
        walkViewTree( elem.viewSet.rootViewBox );
    }

    //this elem, and all objects reachable from it are now safe to be
    // stringified with JSON..  so do it!
    var stringOfElemNode = JSON.stringify( elem, null, '\t' );
    console.log("JSON of elem: " + stringOfElemNode );
    persistString( stringOfElemNode );
}

    persistTheGraph( syntaxGraph );

console.log("\npersisting graph done!\n")

//retrievePersistedString();

//walk the tree, replacing all parent pointers with ID
// dont bother keeping shadow copy, easily restored without copy
function walkViewTree( viewBox ) {
    if(viewBox.parent) viewBox.parent = viewBox.parent.ID;
    if(viewBox.children.length > 0) {
        var childBox = {};
        var numChildren = viewBox.children.length;
        for (i = 0; i < numChildren; i++) {
            childBox = viewBox.children[i];
            if (childBox) {
                walkViewTree( childBox );
            }
        }
    }
//    persistString( JSON.stringify(viewBox))
    console.log("done recursing viewBox: " + viewBox.ID)
}

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
    //convert newline to %N, tab to %T, backslash to %H and forward slash to %S
    // then convert back in server before storing to file
    stringToWrite = stringToWrite.replace(/[\t]/g,'%T');
    stringToWrite = stringToWrite.replace(/[\n]/g,'%N');
    stringToWrite = stringToWrite.replace(/[\\]/g,'%H');
    stringToWrite = stringToWrite.replace(/[/]/g,'%S');
	var theUrl = "http://localhost:8080/save1elem/" + stringToWrite;

    console.log("theURL: " + theUrl);

    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true );
    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                console.log("response to the write: " + xmlHttp.responseText );
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.onerror = function (e) {
        console.error(xmlHttp.statusText);
    };
    xmlHttp.send( null );
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


