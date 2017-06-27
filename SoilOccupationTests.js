
//This function creates a mask to get the agriculture's pixels 

var classeBV = function(classe){
    var bande = imageAgriculture.expression(
    "b('b1') == "+classe+"").clipToCollection(BV288);
	return imageAgriculture
    .updateMask(bande);
};

//list of the test classes

var classes = [122,146,147,153,155,158];

// fuction calling classesBV for ech test classe

var allClassesBV = function(){
	var nbrMax = classeBV(classes[5]).reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geometry,
        scale: 30,
        maxPixels: 1e9}).get('b1');
	var classeMajoritaire = 0;
	for (var i = 0; i <= classes.length - 1; i++) {
		var result = classeBV(classes[i]);
		var nbr_elt = result.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geometry,
        scale: 30,
        maxPixels: 1e9}).get('b1');
        print(nbr_elt);
        if (nbr_elt >= nbrMax) {
           nbrMax = nbr_elt_band;
           classeMajoritaire = classes[i];
        }
        print(nbrMax);
		//Map.addLayer(result,{}, 'Classe'+classes[i])
	}
	return classeMajoritaire,nbrMax;
};


// function computing the dominant classe in a feature

//Display

var test = allClassesBV();
var test2 = classeBV(122);

var nbr_elt_band = test2.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geometry,
        scale: 30,
        maxPixels: 1e9});

print(nbr_elt_band);


