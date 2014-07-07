
//load in the famous stuff -- so far only figured out how to do it via html tag..

document.write('<script type="text/javascript"> require(["famous_learning"]);</script>');
//document.write('<script type="text/javascript"> require(["draw_svg_example"]);</script>');
//=========================

var el =  document.createElement("h1")
el.id="title";
el.innerHTML = "Some title";
document.body.appendChild(el);

var el2 =  document.createElement("span")
el2.style.display="block";
el2.style.width="100%";
el2.innerHTML = "Some arb text";
document.body.appendChild(el2);

function appendHtml(el, str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) {
      if ( div.children[0].tagName == 'LINK' ) {
          // Create an actual link element to append later
          style = document.createElement('link');
          style.href = div.children[0].href;
          // append your other things like rel, type, etc
          el.appendChild(style);
      }
      el.appendChild(div.children[0]);
  }
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.fillStyle = "#FF0000";
ctx.fillRect(0,0,150,75);

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.moveTo(0,0);
ctx.lineTo(200,100);
ctx.stroke();

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.arc(95,50,40,0,Math.PI);
ctx.stroke();

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.font = "30px Arial";
ctx.fillStyle = "#000000";
ctx.fillText("Hello World",10,50);

ctx.fillStyle = "#FF0000";
ctx.fillText("Hello World",10,50);

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.font = "30px Arial";
ctx.fillStyle = "#000000";
ctx.strokeText("Hello World",10,90);

var c = document.getElementById("POPCanvas");
var ctx = c.getContext("2d");
ctx.font = "30px Arial";
ctx.fillStyle = "#000000";
ctx.strokeText("Hello POP!",10,90);

//A syntax graph consists of two kinds of elements, plus a list of properties attached to each element

//var surname = prompt('Greetings friend, may I enquire as to your surname?');

var i = 1;
while (i < 2) {
//    alert(i);
    i = i + 1;
}

for (var i = 1; i < 2; i++) {
//    alert(i);
}

var add = function (a, b) {
    return a + b;
};


var result = add(1, 2); // result is now 3


var jedi = {
    name: "Yoda",
    age: 899,
    talk: function () { alert("another... Sky... walker..."); }
};

var dog = {};

dog.bark = function () { alert("Woof!"); };

var helloFrom = function (personName) {
    return "Hello from " + personName;
}

var people = ['Tom', 'Yoda', 'Ron'];

people.push('Bob');
people.push('Dr Evil');

people.pop();

for (var i=0; i < people.length; i++) {
    var greeting = helloFrom(people[i]);
//    alert(greeting);
}

var person = {
    age: 122
};

person.name = {
    first: "Jeanne",
    last: "Calment"
};

var properties = [];

var exampleSyntaxGraph = {};

exampleSyntaxGraph.root = 
 { properties: {},
   linksIn:    {},
   linksOut:   {},
   subElems:   {}
 };

exampleSyntaxGraph.root.properties.propertyName = "ElementType";exampleSyntaxGraph.root.properties.propertyValue = "Command";
exampleSyntaxGraph.root.properties.propertyName = "ElementType";



