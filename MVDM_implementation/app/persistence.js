
define( function(require, exports, module) {

//Get the class objects that define behavior for each of the structures that
// appears in a POP syntax graph.. will use these as read in JSON of a graph
// and parse it into objects of these classes!
var graphClasses = require("./POPGraphClasses");


//===========================
//==  Learning stuff -- playing with local file system things..
//===========================

//note: only Chrome supports the file api !
// start Chrome with flag "--allow-file-access-from-files" to enable the API


//put a file selector button onto the screen and register an event handler
// that fires after one or a group of files is chosen
    var outputEl = document.body.appendChild(document.createElement("output"));
    outputEl.id = "fileListOutput";

    var inputEl = document.createElement("div");
    document.body.appendChild(inputEl);
    var innerHTMLStr = '<input type="file" id="fileChooserElem" name="myfiles[]" multiple />';
    inputEl.innerHTML = innerHTMLStr;

    var gottenElem = document.getElementById("fileChooserElem");
    gottenElem.addEventListener('change', handleFileSelect, false);

    //The event handler
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        console.log("got event! ");

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push (
                    '<li><strong>' + f.name + '</strong> (' + (f.type || "n/a") + ') - ' +
                    f.size + ' bytes, last modified: ' +
                    (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a") +
                    '</li>');
            var reader = new FileReader();

            //The file API is asynchronous, so before do a read, register
            // a callback that runs when the read completes.
            // It's a Closure, which encloses the file info as theFile.
            //The closure runs now, which makes a function invocation body
            // that includes the parameter, and this run makes a new function
            // spec which is returned as the callback!  That new function spec
            // has the invocation of the closure attached to it, so it still
            // has the closure parameter (theFile) available when it is called
            // back later.
            reader.onload = (function(theFile) {
                return function(e) {
                    console.log("file: " + theFile.name + " content: " + e.target.result);
                };
            })(f); //here, invoke the closure function, passing it the file

            // trigger the onload -- reads in the image file as a data URL.
            console.log("file contents: " + reader.readAsText(f) );
        }
        document.getElementById('fileListOutput').innerHTML = '<ul>' + output.join('') + '</ul>';
        console.log("files: " + output.join(""));
    }

//this is a call-back that runs at the conclusion of initializing the file system
    function onInitFs(fs) {
        console.log('\n\n!!!Opened file system: ' + fs.name +"\n\n");
    }


//note, in order to get persistent file system access to work, had to start
// chrome with the flag "--allow-file-access-from-files"   and added
// "--allow-file-access"  just for good measure
//Test that file system access works via the Filer.js demo in the packages-
// libraries-tools directory -- click on index and see if red "error" shows up
    navigator.webkitPersistentStorage.requestQuota (
            1024*1024*280,
        function(grantedBytes) {
            document.getElementById('fileListOutput').innerHTML = 'request quota callback: ' + grantedBytes;
            window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, errorHandler);
        },
        errorHandler
    )


    function errorHandler(e) {
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };

        console.log('Error: ' + msg);
    }


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
    function persistTheGraph( theGraphRoot ) {
        var shadowGraphRoot = {};

        //save out the top level object that has the handles to the view hierarchy root
        // and the root element.  Also persist the view hierarchy root because it doesn't
        // fit cleanly to try to reach it from the root element..  by persisting it here,
        // can then do a single recursive call and only pass the next syntax element to
        // clean up.  Any view stuff will be reached from that element
        var rootElem = theGraphAnchor.rootElem; //save 'cause pointers about to be replaced
        persistAnchorAndViewSetRoot(theGraphAnchor, shadowGraphRoot);
        visitNextElemAndPersistIt(rootElem);
//	endPersisting();   //tell web server that persist protocol ended

        //now, restore all the pointers, replacing the IDs with pointer to object
        restoreAnchorAndViewSetRoot(theGraphAnchor, shadowGraphRoot);
        visitNextElemAndRestoreIt(rootElem);
    }

    function persistAnchorAndViewSetRoot(theGraphRoot, shadowGraphRoot) {
        //save the top level root object and the top view set, which is above
        // the view set of the root element
        //Replace pointer to root elem with its ID and cut off pointers
        // inside the root view set link, so JSON stringify only gets the root
        // view set and its one view set link object
        shadowGraphRoot.rootElem = theGraphAnchor.rootElem;
        theGraphAnchor.rootElem = theGraphAnchor.rootElem.ID;

        //remove the back link from the view set link back to the root view set
        shadowGraphRoot.backLinkToRootViewSet = theGraphAnchor.rootViewSet.viewSetLinks[0].referenceViewSet;
        theGraphAnchor.rootViewSet.viewSetLinks[0].referenceViewSet =
            theGraphAnchor.rootViewSet.viewSetLinks[0].referenceViewSet.ID;

        //cut off the view set link, that points to the view set of the root element
        shadowGraphRoot.linkToRootElemsViewSet =
            theGraphAnchor.rootViewSet.viewSetLinks[0].subordinateViewSet;
        theGraphAnchor.rootViewSet.viewSetLinks[0].subordinateViewSet =
            theGraphAnchor.rootViewSet.viewSetLinks[0].subordinateViewSet.ID;

        //Now, ready to go, stringify away!
        var stringOfGraphRoot = JSON.stringify(theGraphAnchor, null, '\t');
//    console.log("JSON of graphRoot: " + stringOfGraphRoot );
        persistString(stringOfGraphRoot)
    }

//Contract: have already verified that this elem has not been visited before calling
    function visitNextElemAndPersistIt(elem) {
        //mark the element as having been visited
        elem.isAlreadyVisited = true;

        //cut the back link going from the view set to the elem node
        if ((elem.viewSet || {}).syntaxElem) {
            elem.viewSet.syntaxElem = elem.viewSet.syntaxElem.ID;
        }

        //visit each port
        var elemToVisit = {};
        var i = 0;
        var j = 0;
        var inPort = {};
        var ports = elem.portsIn;
        var numPorts = ports.length;
        var numPairedPorts = 0;
        for (j = 0; j < numPorts; j++) {
            inPort = ports[j];
            numPairedPorts = inPort.pairedPorts.length;
            //follow each pairedPort link
            for (i = 0; i < numPairedPorts; i++) {
                //process element linked to the paired port
                elemToVisit = inPort.pairedPorts[i].element;
                if (!elemToVisit.isAlreadyVisited) {
                    visitNextElemAndPersistIt(elemToVisit);
                }
                //back from visit, replace pointer with ID of pointed to port
                inPort.pairedPorts[i] = inPort.pairedPorts[i].ID;
            }
            //replace the element back-pointer in the port object
            inPort.element = inPort.element.ID;
        }
        ports = elem.portsOut;
        numPorts = ports.length;
        var outPort = {};
        for (j = 0; j < numPorts; j++) {
            outPort = ports[j];
            numPairedPorts = outPort.pairedPorts.length;
            //follow each pairedPort link
            for (i = 0; i < numPairedPorts; i++) {
                //process element linked to the paired port
                elemToVisit = outPort.pairedPorts[i].element;
                if (!elemToVisit.isAlreadyVisited) {
                    visitNextElemAndPersistIt(elemToVisit);
                }
                //when come back, replace pointer with ID of pointed to port
                outPort.pairedPorts[i] = outPort.pairedPorts[i].ID;
            }
            //replace the element back-pointer in the port object
            outPort.element = outPort.element.ID;
        }
        var numLinkedElems = elem.linkedElems.length;
        for (i = 0; i < numLinkedElems; i++) {
            if (!(elem.linkedElems[i].isAlreadyVisited)) {
                visitNextElemAndPersistIt(elem.linkedElems[i]);
            }
            //back from visit, replace pointer with ID of pointed to elem
            elem.linkedElems[i] = elem.linkedElems[i].ID;
        }

        //cut links to the view sets embedded within view set link objects
        if ((elem.viewSet || {}).viewSetLinks) {
            var viewSet = elem.viewSet;
            var numLinked = viewSet.viewSetLinks.length;
            var viewSetLink = {};
            for (i = 0; i < numLinked; i++) {
                viewSetLink = viewSet.viewSetLinks[i];
                if (viewSetLink) {
                    viewSetLink.referenceViewSet = viewSetLink.referenceViewSet.ID;
                    viewSetLink.subordinateViewSet = viewSetLink.subordinateViewSet.ID;
                }
            }
        }
        //cut back-links to parent view boxes within view set tree
        if ((elem.viewSet || {}).rootViewBox) {
            walkViewTree(elem.viewSet.rootViewBox);
        }

        //this elem, and all objects reachable from it are now safe to be
        // stringified with JSON..  so do it!
        var stringOfElemNode = JSON.stringify(elem, null, '\t');
//	console.log("JSON of elem: " + stringOfElemNode );
        persistString(stringOfElemNode);
    }

//walk the tree, replacing all parent pointers with ID
// dont bother keeping shadow copy, easily restored without copy
    function walkViewTree(viewBox) {
        if (viewBox.parent) viewBox.parent = viewBox.parent.ID;
        if (viewBox.children.length > 0) {
            var childBox = {};
            var numChildren = viewBox.children.length;
            for (i = 0; i < numChildren; i++) {
                childBox = viewBox.children[i];
                if (childBox) {
                    walkViewTree(childBox);
                }
            }
        }
//        console.log("done recursing viewBox: " + viewBox.ID)
    }

 //=====================================
//Search the graph for places where pointer has been replaced by an ID,
// when find one, look up the object with that ID and replace the ID with pointer
    function restoreAnchorAndViewSetRoot( theGraphAnchor ) {
        var theObjColl = graphClasses.theObjColl;

        theGraphAnchor.rootElem = theObjColl.getByID(theGraphAnchor.rootElem);

        //restore the back link from the view set link
        theGraphAnchor.rootViewSet.viewSetLinks[0].referenceViewSet =
            theObjColl.getByID(theGraphAnchor.rootViewSet.viewSetLinks[0].referenceViewSet);
        theGraphAnchor.rootViewSet.viewSetLinks[0].subordinateViewSet =
            theObjColl.getByID(theGraphAnchor.rootViewSet.viewSetLinks[0].subordinateViewSet);
    }

//Contract: have already verified that this elem has not been visited before calling
    function visitNextElemAndRestoreIt( elem ) {
        //mark the element as having been visited
        elem.isAlreadyVisited = false;  //all start at true, making false marks as restored

        //restore the back link going from the view set to the elem node
        if ((elem.viewSet || {}).syntaxElem) { //idiom makes safe when viewset undefined
            elem.viewSet.syntaxElem = elem.getByID(elem.viewSet.syntaxElem);
        }

        //restore each port
        var elemToVisit = {};
        var i = 0;
        var j = 0;
        var inPort = {};
        var portsIn = elem.portsIn;
        var numPorts = portsIn.length;
        var numPairedPorts = 0;
        //as go along, restore pointers by looking them up
        for (j = 0; j < numPorts; j++) {
            inPort = portsIn[j];

            //restore the element back-pointer in the port object
            inPort.element = inPort.getByID(inPort.element);

            //follow each pairedPort link
            numPairedPorts = inPort.pairedPorts.length;
            for (i = 0; i < numPairedPorts; i++) {
                //process element linked to the paired port
                //first, replace pointer to port
                inPort.pairedPorts[i] = inPort.getByID(inPort.pairedPorts[i]);
                elemToVisit = inPort.pairedPorts[i].element;
                if (typeof elemToVisit == 'number') {
                    //means the element back-pointer inside the port on the other end
                    // is still the ID..  IE, that port and its element not restored yet
                    visitNextElemAndRestoreIt(outPort.getByID(elemToVisit));
                }
                else if (elemToVisit.isAlreadyVisited) { //if still marked from before
                    //don't think this case will ever come up!  if elem not restored,
                    // then the elem's port's back pointer will still be an ID and above
                    // if() will catch it..
                    visitNextElemAndRestoreIt(elemToVisit);
                }
            }
        }
        var outPorts = elem.portsOut;
        numPorts = outPorts.length;
        var outPort = {};
        for (j = 0; j < numPorts; j++) {
            outPort = outPorts[j];
            //restore back link from outPort to its element
            outPort.element = outPort.getByID(outPort.element);
            numPairedPorts = outPort.pairedPorts.length;
            //visit each pairedPort link
            for (i = 0; i < numPairedPorts; i++) {
                //restore the pointer to the paired port
                outPort.pairedPorts[i] = outPort.getByID(outPort.pairedPorts[i]);
                //process element linked to the paired port
                elemToVisit = outPort.pairedPorts[i].element;
                if (typeof elemToVisit == 'number') {
                    //means the element back-pointer inside the port on the other end
                    // is still the ID..  IE, that port and its element not restored yet
                    visitNextElemAndRestoreIt(outPort.getByID(elemToVisit));
                }
                else if (elemToVisit.isAlreadyVisited) { //if needs restoring
                    //don't think this case will ever come up!  if not restored,
                    // then the elem back pointer will still be an ID and above
                    // if() will catch it..
                    visitNextElemAndRestoreIt(elemToVisit);
                }
            }
        }
        var numLinkedElems = elem.linkedElems.length;
        for (i = 0; i < numLinkedElems; i++) {
            //restore linked elem first, then process that restored elem
            elem.linkedElems[i] = elem.getByID(elem.linkedElems[i]);
            if (elem.linkedElems[i].isAlreadyVisited) {
                visitNextElemAndRestoreIt(elem.linkedElems[i]);
            }
        }

        //restore links to the view sets embedded within view set link objects
        if ((elem.viewSet || {}).viewSetLinks) {
            var viewSet = elem.viewSet;
            var numLinked = viewSet.viewSetLinks.length; //array always exists
            var viewSetLink = {};
            for (i = 0; i < numLinked; i++) {
                viewSetLink = viewSet.viewSetLinks[i];
                if (viewSetLink) {
                    viewSetLink.referenceViewSet = elem.getByID(viewSetLink.referenceViewSet);
                    viewSetLink.subordinateViewSet = elem.getByID(viewSetLink.subordinateViewSet);
                }
            }
        }
        //restore back-links to parent view boxes within view set tree
        if ((elem.viewSet || {}).rootViewBox) { //idiom that's safe when viewSet undefine
            walkViewTreeAndRestore(elem.viewSet.rootViewBox);
        }
    }

//walk the tree, restoring all IDs with parent and children pointers
    function walkViewTreeAndRestore(viewBox) {
        //replace ID that's in the parent field with looked up object pointer
        if (viewBox.parent) viewBox.parent = viewBox.getByID(viewBox.parent);
        if (viewBox.children.length > 0) { //all view boxes should have array!
            var childBox = {};
            var numChildren = viewBox.children.length;
            for (i = 0; i < numChildren; i++) {
                viewBox.children[i] = viewBox.getByID(viewBox.children[i]);
                childBox = viewBox.children[i];
                if (childBox) {
                    walkViewTree(childBox);
                }
            }
        }
//        console.log("done restoring viewBox: " + viewBox.ID)
    }

//==================================

    function clearPersistentGraph() {
        //bottle server
        var theUrl = "http://localhost:8080/cleargraph";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        console.log("about to send clear graph command");
        xmlHttp.send(null);
        console.log("done clearing: " + xmlHttp.responseText);
    }

    function persistString(stringToWrite) {
        //bottle server
        //convert newline to %N, tab to %T, backslash to %H and forward slash to %S
        // then convert back in server before storing to file
        stringToWrite = stringToWrite.replace(/[\t]/g, '%T');
        stringToWrite = stringToWrite.replace(/[\n]/g, '%N');
        stringToWrite = stringToWrite.replace(/[\\]/g, '%H');
        stringToWrite = stringToWrite.replace(/[/]/g, '%S');
        var theUrl = "http://localhost:8080/save1elem/" + stringToWrite;

        console.log("theURL: " + theUrl);

        var xmlHttp = null;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);  //true means send asynchronously
        xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    console.log("response to the write: " + xmlHttp.responseText);
                } else {
                    console.error(xmlHttp.statusText);
                }
            }
        };
        xmlHttp.onerror = function (e) {
            console.error(xmlHttp.statusText);
        };
        xmlHttp.send(null);
    }

    function endPersisting() {
        //bottle server
        var theUrl = "http://localhost:8080/endsavinggraph";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);//do synchronously
        xmlHttp.send(null);
        console.log("end persisting: " + xmlHttp.responseText);
    }


//=============================================================
//==
//==  Retrieve SyntaxGraph from server
//==
//=============================================================

    function retrieveTheGraph() {
        var theUrl = "http://localhost:8080/retrievegraph";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); //do synchronously
        xmlHttp.send(null);
        var theJSONString = xmlHttp.responseText;

        //starting a new graph, so the set of objects in the obj coll not
        // objects from this new graph -- reset the object collection
        // then fill it back up again as parse the objects in..
        graphClasses.theObjColl = new graphClasses.ObjColl(); //make empty one

//        console.log( "Retrieved: " + theJSONString );

        //split the string into separate JSON object-strings
        var objJSONArray = theJSONString.split(/separator\n/);

        //remove the last, empty string
        var temp = objJSONArray.pop();
        if( temp !== "" ) objJSONArray.push(temp); //if not empty, put it back

        //now parse each string, turning it into objects, and registering them
        for( var i = 0; i < objJSONArray.length; i++ ) {
            JSON.parse(objJSONArray[i], restoreParsedObj);
        }
        //one of the parsed JSON strings was the graph anchor obj, which
        // was placed into theObjColl during JSON parsing.  Grab it
        // then call restore, which will walk the graph, find the places
        // where a pointer should be, grab the ID sitting there, and use
        // that to get the obj and replace the ID with pointer to the object
        theGraphAnchor = graphClasses.theObjColl.graphAnchor;
        restoreAnchorAndViewSetRoot( theGraphAnchor );
        visitNextElemAndRestoreIt( theGraphAnchor.rootElem );
        return theGraphAnchor;
    }

    //This registers each object that has an ID and restores any that have
    // a type to their correct class, and it restores handler functions
    function restoreParsedObj(k,v) {
        if(v.rootElem) { //This is the graph anchor (AKA head)!
            graphClasses.theObjColl.graphAnchor = v;
        }
        if(v.ID) { //ID is a valid field when v is a full object, to be registered
            console.log("inserting: " + k + " | ID: " + v.ID);
            graphClasses.theObjColl.insertByID( v ); //have a struct worthy of registering
        }
        if( v.type ) {//add the appropriate  __proto__ obj
            switch( v.type ) {
                case "GraphElem": v.__proto__ = graphClasses.graphElemProto;
                    break;
                case "ViewSet": v.__proto__ = graphClasses.viewSetProto;
                    break;
                case "ViewSetLink": v.__proto__ = graphClasses.viewSetLinkProto;
                    break;
                case "ViewBox": v.__proto__ = graphClasses.viewBoxProto;
                    break;
                case "GraphProperty": v.__proto__ = graphClasses.graphPropertyProto;
                    break;
                case "GraphPort": v.__proto__ = graphClasses.graphPortProto;
                    break;
            }
        }
        switch(k) {
            case "handlers": //view box's array of handler fns
                var hdlrPair; //v is an array of objects, each w/type and fn
                for( var i = 0; i < v.length; i++) {
                    hdlrPair = v[i];
                    switch (hdlrPair.type) {
                        case "key":
                            hdlrPair.fn = graphClasses.stdKeyHdlr;
                            break;
                        case "click":
                            hdlrPair.fn = graphClasses.stdClickHdlr;
                            break;
                        case "drag":
                            hdlrPair.fn = graphClasses.stdDragHdlr;
                            break;
                    }
                }

                //console.log("key: " + k + " | ret value: " + v + " add .toJSON before stringify!");
                break;
            case "isAlreadyVisited":
                return true; //restore relies on this being true
                break;
        }
        return v;
    }

//                //for this top group, if value is number then it's the ID of obj to get
//                case "rootElem":
//                case "referenceViewSet":
//                case "subordinateViewSet":
//                case "element":
//                case "syntaxElem":
//                case "parent":
//                    if( typeof v === 'number' ) {
//                        var theObj = graphClasses.theObjColl.getByID(v);
//                        var retValue = theObj ? theObj : v; //means need two passes!
//                        console.log("key: " + k + " | ID: " + v + " | ret value: " + retValue);
//                        return retValue;
//                    }
//                    break;
//                //for these two, value is an array of IDs
//                case "pairedPorts":
//                case "linkedElems":
//                    for( var i = 0; i < v.length; i++) {
//                        var val = v[i];
//                        if( typeof val === 'number' ) {
//                            var theObj = graphClasses.theObjColl.getByID(val);
//                            var retValue = theObj ? theObj : val; //means need two passes!
//                            console.log("array -- key: " + k + " | ID: " + v[i] + " | ret value: " + i + ": " + retValue);
//                            v[i] = retValue;
//                        }
//                    }
//                    return v;
//                    break;

//================================
    function startRetrieve() {
        var theUrl = "http://localhost:8080/startretrievinggraph";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        console.log("started retrieve: " + xmlHttp.responseText);
    }

    function retrieveNextPersistedString() {
        var theUrl = "http://localhost:8080/get1elem";
        var xmlHttp = null;

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        console.log("retrieved string: " + xmlHttp.responseText);
    }

    function endRetrieve() {
        var theUrl = "http://localhost:8080/endretrievinggraph";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        console.log("end retrieve: " + xmlHttp.responseText);
    }

//=================================


return {
    persistString:          persistString,
    clearPersistentGraph:   clearPersistentGraph,
    persistTheGraph:        persistTheGraph,
    retrieveTheGraph:       retrieveTheGraph
};
});
