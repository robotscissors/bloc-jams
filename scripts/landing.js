var animatePoints = function() {

  var points = document.getElementsByClassName('point');

  var revealPoint = function(whichPoint) {
      points[whichPoint].style.opacity = 1;
      points[whichPoint].style.transform = "scaleX(1) translateY(0)";
      points[whichPoint].style.msTransform = "scaleX(1) translateY(0)";
      points[whichPoint].style.WebkitTransform = "scaleX(1) translateY(0)";
  };

  for (var i=0; i<points.length;i++){
    revealPoint(i);
  }

};
