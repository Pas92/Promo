window.onload = function(){
  let preLoader = document.body.querySelector("#preloader");
  preLoader.style.display = 'none';
}

let sliderSlider = new SimpleSlider('.simple-slider-first-slider', {enableDrag: false});
let infoSlider = new SimpleSlider('.simple-slider-second-info', {enableDrag: false});
let capabilitiesSlider = new SimpleSlider('.simple-slider-third-capabilities', {enableDrag: false});
let modelSlider = new SimpleSlider('.simple-slider-fourth-model', {enableDrag: false});
let gallerySlider = new SimpleSlider('.simple-slider-fifth-gallery', {enableDrag: false});
let downloadsSlider = new SimpleSlider('.simple-slider-sixth-downloads', {enableDrag: false});

sliderSlider.buttons[0].addEventListener('click', goToPrev);
sliderSlider.buttons[1].addEventListener('click', goToNext);


function goToPrev(event) {
  infoSlider.prevSlide();
  infoSlider.prevSlide();
  capabilitiesSlider.prevSlide();
  modelSlider.prevSlide();
  gallerySlider.prevSlide();
  downloadsSlider.prevSlide();
}

function goToNext(event) {
  infoSlider.nextSlide();
  capabilitiesSlider.nextSlide();
  modelSlider.nextSlide();
  gallerySlider.nextSlide();
  downloadsSlider.nextSlide();
}

function goToNextSlide() {
  infoSlider.nextSlide();
  capabilitiesSlider.nextSlide();
  modelSlider.nextSlide();
  gallerySlider.nextSlide();
  downloadsSlider.nextSlide();
}

function goToPrevSlide() {
  infoSlider.prevSlide();
  infoSlider.prevSlide();
  capabilitiesSlider.prevSlide();
  modelSlider.prevSlide();
  gallerySlider.prevSlide();
  downloadsSlider.prevSlide();
}
