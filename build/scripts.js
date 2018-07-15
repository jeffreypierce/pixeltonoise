/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	const audioContext = new window.AudioContext();
	const filter = audioContext.createBiquadFilter();
	const analyser = audioContext.createAnalyser();
	const gain = audioContext.createGain();
	const noise = audioContext.createBufferSource();

	const p2n = document.querySelector('.p2n');
	const bg = document.querySelector('.background');
	const canvas = document.querySelector('.canvas');
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	const dots = [];
	const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

	const generateNoiseBuffer = length => {
	  const _length = audioContext.sampleRate * length;
	  const arrayBuffer = new Float32Array(_length);
	  const white = () => 2 * Math.random() - 1;
	  let i = 0;
	  let b0 = 0.0;
	  let b1 = 0.0;
	  let b2 = 0.0;
	  let b3 = 0.0;
	  let b4 = 0.0;
	  let b5 = 0.0;
	  let b6 = 0.0;

	  while (i < _length) {
	    const _white = white();
	    b0 = 0.99886 * b0 + _white * 0.0555179;
	    b1 = 0.99332 * b1 + _white * 0.0750759;
	    b2 = 0.96900 * b2 + _white * 0.1538520;
	    b3 = 0.86650 * b3 + _white * 0.3104856;
	    b4 = 0.55000 * b4 + _white * 0.5329522;
	    b5 = -0.7616 * b5 - _white * 0.0168980;
	    arrayBuffer[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + _white * 0.5362;
	    arrayBuffer[i] *= 0.11;
	    b6 = _white * 0.115926;
	    i++;
	  }
	  let audioBuffer = audioContext.createBuffer(1, _length, audioContext.sampleRate);
	  audioBuffer.getChannelData(0).set(arrayBuffer);
	  analyser.getFloatTimeDomainData(arrayBuffer);
	  return audioBuffer;
	};

	const visualizeNoise = () => {
	  const normalize = (y, h) => y / 256 * h;
	  let w = canvas.width;
	  let h = canvas.height;
	  let points = new Uint8Array(1024);
	  analyser.getByteTimeDomainData(points);

	  let drawContext = canvas.getContext('2d');
	  drawContext.clearRect(0, 0, w, h);
	  drawContext.strokeStyle = '#ffffff';
	  drawContext.lineWidth = 2;
	  drawContext.lineCap = 'butt';
	  drawContext.lineJoin = 'miter';
	  drawContext.beginPath();
	  drawContext.moveTo(0, normalize(points[0], h));

	  let i = 0;
	  while (i < points.length) {
	    drawContext.lineTo(w * (i + 1) / points.length, normalize(points[i], h));
	    i++;
	  }
	  drawContext.stroke();
	};

	const resize = e => {
	  canvas.width = document.body.clientWidth;
	  canvas.height = document.body.clientHeight;
	};

	class Dot {
	  constructor() {
	    this.x = 0;
	    this.y = 0;
	    this.node = (() => {
	      let n = document.createElement("div");
	      n.className = "trail";
	      document.body.appendChild(n);
	      return n;
	    })();
	  }

	  draw() {
	    this.node.style.left = this.x + "px";
	    this.node.style.top = this.y + "px";
	  }
	};

	const drawFollower = () => {
	  let x = mouse.x + 10;
	  let y = mouse.y + 10;

	  for (const [index, dot] of dots.entries()) {
	    let nextDot = dots[index + 1] || dots[0];
	    dot.x = x;
	    dot.y = y;
	    dot.draw();
	    x += (nextDot.x - dot.x) * .15;
	    y += (nextDot.y - dot.y) * .15;
	  };
	};

	const animationLoop = () => {
	  visualizeNoise();
	  drawFollower();
	  window.requestAnimationFrame(animationLoop);
	};

	const mousemove = e => {
	  mouse.x = e.clientX;
	  mouse.y = e.clientY;
	  filter.frequency.value = e.clientX * 3;
	  filter.Q.value = e.clientY / 50;
	};

	const init = () => {
	  noise.buffer = generateNoiseBuffer(256);
	  noise.loop = true;
	  gain.gain.value = 0.75;

	  noise.connect(filter);
	  filter.connect(gain);
	  gain.connect(audioContext.destination);
	  gain.connect(analyser);

	  for (var i = 0; i < 50; i++) {
	    var d = new Dot();
	    dots.push(d);
	  }
	  noise.start();
	  window.addEventListener("mousemove", mousemove);
	  window.addEventListener('resize', resize);
	  window.requestAnimationFrame(animationLoop);
	};

	init();

/***/ })
/******/ ]);