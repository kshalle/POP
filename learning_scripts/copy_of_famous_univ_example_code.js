var Engine        = require('famous/core/Engine');
var Surface       = require('famous/core/Surface');
var Transform     = require('famous/core/Transform');
var StateModifier = require('famous/modifiers/StateModifier');
var Easing        = require('famous/transitions/Easing');
var Lightbox      = require('famous/views/Lightbox');
var ImageSurface  = require('famous/surfaces/ImageSurface');
var DeviceView    = require('./DeviceView');

var mainContext = Engine.createContext();

var device, lightbox;
var slides = [];
var index = 0;
var arrowMod;

var lightboxOptions = {
  inOpacity: 1,
  outOpacity: 1,
  inTransform: Transform.translate(320,0, 0),
  outTransform: Transform.translate(-320, 0, 1),
  inTransition: { duration: 400, curve: Easing.outBack },
  outTransition: { duration: 150, curve: Easing.easeOut }
};

createDevice();
createSlides();
createLightbox();

function createDevice() {
  var deviceOptions = {
    type: 'iphone',
    height: window.innerHeight - 100
  };

  device = new DeviceView(deviceOptions);

  var deviceModifier = new StateModifier({
    size: device.getSize(),
    origin: [0.5, 0.5]
  });

  mainContext.add(deviceModifier).add(device);
}

function createSlides() {
  var slideContent = [
    '<svg width="100" height="80"><rect x="30" y="10" rx="20" ry="20" width="50" height="50" style="fill:red;stroke:black;stroke-width:3;opacity:0.5">',
    '<img src="http://launch.famo.us/fu-assets/hello/slide1.png" width="100%">',
    '<img src="http://launch.famo.us/fu-assets/hello/slide2.png" width="100%">',
    '<img src="http://launch.famo.us/fu-assets/hello/slide3.png" width="100%">'];
    
  var background = new Surface({
    properties: {
      backgroundColor: '#FA5C4F'
    }
  });

  device.add(background);

  for (var i = 0; i < slideContent.length; i++) {
    var slide = new Surface({
      content: slideContent[i],
      properties: {
        color: 'white',
        lineHeight: '200%',
        textAlign: 'center',
        fontSize: '36px',
        cursor: 'pointer'
      }
    });
    
    slide.on('click', showNextSlide);

    slides.push(slide);
  }
}

function createLightbox() {
  lightbox = new Lightbox(lightboxOptions);
  device.add(lightbox);
  lightbox.show(slides[0]);
}

function showNextSlide() {
  index++;
  if(slides[index]) lightbox.show(slides[index]);

  if(index === 1) {
    GlobalEvents.trigger('pointToButton', 'fullscreen');
  }
}

GlobalEvents.trigger('hideArrowOnToggle')