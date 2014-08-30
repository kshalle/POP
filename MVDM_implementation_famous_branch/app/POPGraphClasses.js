

define( function(require, exports, module) {

//Using inheritance via prototype, to keep a running hash of objects
// indexed by their ID -- ID is auto generated as the objects are created
function ObjColl(){
    //start at 1 because 0 is interpreted same a null and other special ways
    currID = 1;   //private, will create one ObjColl and use as prototype
    objColl = [];
    this.getNextID = function( obj ) {
        objColl[currID] = obj; //objColl and currID are in the closure!
        return currID++;
    };
    this.getByID = function( ID ) {
        return objColl[ID];
    }
    this.insertByID = function( obj ){
        objColl[obj.ID] = obj; //objColl is in the closure!
    }
}
var theObjColl = new ObjColl();

//need all the classes to have common ObjColl instance, but each has
// different constructor!  So, each needs its own prototype instance, so
// need to create an empty object to act as the prototype instance, so can
// add the constructor to that instance
function ConstructorBuffer(){
}

//create a "class" of graph elements..  make an elem via the "new" call..
function GraphElem() {
    this.type = 'GraphElem';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.properties = [];
    this.portsIn = [];
    this.portsOut = [];
    this.linkedElems = [];
    this.viewSet = undefined;
};
var graphElemProto = new ConstructorBuffer();
graphElemProto.__proto__ = theObjColl;
GraphElem.prototype = graphElemProto;
GraphElem.prototype.constructor = GraphElem;

function ViewSet() {
    this.type = 'ViewSet';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.syntaxElem = {};   //back link to the corresponding syntax graph element
    this.rootViewBox = {};
    this.viewSetLinks = [];
    this.container = {};
    this.setWasProcessedThisRoundTag = 1; //avoid 0.. it doubles as false!
    this.makeProcessedTagCurrent = function(  ){
        this.setWasProcessedThisRoundTag = this.__proto__.currentRoundTag;
    }
    this.setWasProcessedThisRound = function(){ return currentRoundTag === setWasProcessedThisRoundTag };
}
var viewSetProto = new ConstructorBuffer();
    //put functionality for traversing the view set graph here, in prototype,
    // so that have one current round variable shared by all view set instances
viewSetProto.currentRoundTag = 2;
viewSetProto.advanceToNextRound = function(){
    this.__proto__.currentRoundTag += 1 }; //this is obj instance when called
viewSetProto.__proto__ = theObjColl;
ViewSet.prototype = viewSetProto;
ViewSet.prototype.constructor = ViewSet;

function ViewSetLink() {
    this.type = 'ViewSetLink';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.doNotPass = false;
    this.parentViewSet = {};
    this.childViewSet = {};
    this.xOffset = 0;
    this.yOffset = 0;
    this.scale = 1.0;
}
var viewSetLinkProto = new ConstructorBuffer();
viewSetLinkProto.__proto__ = theObjColl;
ViewSetLink.prototype = viewSetLinkProto;
ViewSetLink.prototype.constructor = ViewSetLink;

//the constructor for a ViewBox object
function ViewBox() {
    this.type = 'ViewBox';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.shape = undefined;
    this.width = 0;		//size of bounding box (before scaling)
    this.height = 0;
    this.xOffset = 0;		//offset moves self and all descendants rel to parent
    this.yOffset = 0;
    this.scale = 1.0;		//scale applies to self and all descendants
    this.parent = undefined;	//allows traversing upward through hierarchy
    this.children = [];	//these are children view bounding boxes
    this.handlers = [];	//array of objects -> { typeOfEvent, Fn }
    this.container = {};
}

var viewBoxProto = new ConstructorBuffer();
viewBoxProto.__proto__ = theObjColl;
ViewBox.prototype = viewBoxProto;
ViewBox.prototype.constructor = ViewBox;
ViewBox.prototype.WithParams = function(shape, width, height, xOffset, yOffset, scale) {
    this.shape = shape;
    this.width = width;		//size of bounding box (before scaling)
    this.height = height;
    this.xOffset = xOffset;		//offset moves self and all descendants rel to parent
    this.yOffset = yOffset;
    this.scale = scale;		//scale applies to self and all descendants
    return this; //so object returns from "constructor" call..
}

function GraphProperty() {
    this.type = 'GraphProperty';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.propertyName = "";
    this.propertyValue = "";
    this.subProperties = [];
}
var graphPropertyProto = new ConstructorBuffer();
graphPropertyProto.__proto__ = theObjColl;
GraphProperty.prototype = graphPropertyProto;
GraphProperty.prototype.constructor = GraphProperty;
GraphProperty.prototype.WithParams = function(propertyName, propertyValue) {
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
    return this;
}

function GraphPort() {
    this.type = 'GraphPort';
    this.ID = this.getNextID(this); //this.getNextID promotes to prototype
    this.element = {};
    this.properties = [];
    this.pairedPorts = [];
}
var graphPortProto = new ConstructorBuffer();
graphPortProto.__proto__ = theObjColl;
GraphPort.prototype = graphPortProto;
GraphPort.prototype.constructor = GraphPort;
GraphPort.prototype.WithElem = function(elem) {
    this.element = elem;
    return this;
}


function stdKeyHdlr(e) {
    console.log("key event: " + e.type + " on: " + e.target.ID);
}

function stdClickHdlr(e) {
    console.log("click event: " + e.type + " on: " + e.target.ID);
}

function stdDragHdlr(e) {
    console.log("drag event: " + e.type + " on: " + e.target.ID);
}


return {
    theObjColl:     theObjColl,
    ObjColl:        ObjColl,     //the class that theObjColl is instance of
    GraphElem:      GraphElem,
    graphElemProto: graphElemProto,
    ViewSet:        ViewSet,
    viewSetProto:   viewSetProto,
    ViewSetLink:    ViewSetLink,
    viewSetLinkProto: viewSetLinkProto,
    ViewBox:        ViewBox,
    viewBoxProto:   viewBoxProto,
    GraphProperty:  GraphProperty,
    graphPropertyProto: graphPropertyProto,
    GraphPort:      GraphPort,
    graphPortProto: graphPortProto,
    stdKeyHdlr:     stdKeyHdlr,
    stdClickHdlr:   stdClickHdlr,
    stdDragHdlr:    stdDragHdlr
};
});

