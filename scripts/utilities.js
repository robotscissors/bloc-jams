function forEach (arrayOfItems, cBackFunction){
  for (var i=0; i<arrayOfItems.length;i++ ){
    cBackFunction(arrayOfItems[i]);
  }
}
