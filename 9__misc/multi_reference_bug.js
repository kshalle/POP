

define(function(require, exports, module) {
    var Engine           = require("famous/core/Engine");
    var Surface          = require("famous/core/Surface");
    var Modifier         = require("famous/core/Modifier");
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Scrollview       = require("famous/views/Scrollview");

    var mainContext = Engine.createContext();
	var mySurface1 = new Surface({
	  size: [100, 100],
      content: '<svg width="100" height="100"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:black;stroke-width:3;opacity:0.5">',
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});

	var mySurface2 = new Surface({
	  size: [100, 100],
      content: '<svg width="100" height="100"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:blue;stroke-width:3;opacity:0.5">',
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});
	var mySurface3 = new Surface({
	  size: [100, 100],
      content: '<svg width="100" height="100"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:green;stroke-width:3;opacity:0.5">',
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});
	var mySurface4 = new Surface({
	  size: [100, 100],
      content: '<svg width="100" height="100"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:black;stroke-width:3;opacity:0.5">',
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
     }
	});

	var moveModifier1 = new StateModifier({
        transform: Transform.translate(50, 50, 0)
    });
	var moveModifier2 = new StateModifier({
        transform: Transform.translate(100, 100, 0)
    });
	var moveModifier3 = new StateModifier({
        transform: Transform.translate(150, 150, 0)
    });
	var moveModifier4 = new StateModifier({
        transform: Transform.translate(100, 100, 0)
    });
	var moveModifier5 = new StateModifier({
        transform: Transform.translate(100, 100, 0)
    });
//A given surface object will only render once!  Have to
// clone it if want multiple versions to be drawn.
//Same goes for modifiers -- cannot put same modifier object at multiple 
// places within tree -- it will only render children of ONE of those places!
   mainContext.add(moveModifier1).add(mySurface1);
   mainContext.add(moveModifier2).add(mySurface2);
//uncomment this line to see the first disappear
//   mainContext.add(moveModifier3).add(mySurface1);

   //this shows ganged modifiers working correctly
   mainContext.add(moveModifier4).add(moveModifier5).add(mySurface3);

   //this shows that repeating modifier2 makes the second fail to render!
// uncomment this line to see the second disappear!
//   mainContext.add(moveModifier2).add(moveModifier3).add(mySurface4);
   
});
