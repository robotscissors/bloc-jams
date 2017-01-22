var pointsArray = document.getElementsByClassName('point');

var revealPoint = function (singlePoint) {
  singlePoint.style.opacity = 1;
  singlePoint.style.transform = "scaleX(1) translateY(0)";
  singlePoint.style.msTransform = "scaleX(1) translateY(0)";
  singlePoint.style.WebkitTransform = "scaleX(1) translateY(0)";
};


var animatePoints = function (points) {
    forEach(points,revealPoint);
};

window.onload = function() {

  if (window.innerHeight > 950) { //this is specific for larger screens
    animatePoints(pointsArray);
  }
  var sellingPoints = document.getElementsByClassName('selling-points')[0];
  var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;

  window.addEventListener("scroll", function(event) {
    if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
      animatePoints(pointsArray);
    }
  });

}

