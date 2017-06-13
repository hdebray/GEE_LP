// Date filter values

var start = ee.Date('2016-06-01');
var end = ee.Date('2016-07-15');


//This function creates a mask to get the lakes 

var justLake = function(image) {
	var lakesImage = lake288
    .reduceToImage({
    properties: ['OBJECTID'],
    reducer: ee.Reducer.firstNonNull()
    });
    var lakeMask = ee.Image(lakesImage).mask();
  return image
  .updateMask(lakeMask)
  ;
};


// This function masks non-water pixels.

var land_water = function(image){
    var maks_band = image.select('fmask');
    var mask_band = maks_band.updateMask(maks_band.eq(1));
    return image.updateMask(mask_band);
  };


// Function applying the masks 

var imageFiltered = function(imageCollection){
  return (imageCollection)
 .filterDate(start,end)
 .map(justLake)
 .map(land_water)
 .mosaic();
};


// Function collecting the mean color of a lake

var meanLakeColor = function(feature,mosaic){

return ee.Image(mosaic).reduceRegions({
  collection: feature,
  reducer: ee.Reducer.median(),
  scale: 30,
});
};


// Return the different rates between B1,2,3,4 spectral bands

var getColorsRate = function(feature){

var imB1 = feature.reduceToImage({
    properties: ['B1'],
    reducer: ee.Reducer.firstNonNull()
});
var imB2 = feature.reduceToImage({
    properties: ['B2'],
    reducer: ee.Reducer.firstNonNull()
});
var imB3 = feature.reduceToImage({
    properties: ['B3'],
    reducer: ee.Reducer.firstNonNull()
});
var imB4 = feature.reduceToImage({
    properties: ['B4'],
    reducer: ee.Reducer.firstNonNull()
});
var imageImtermediaire = imB1.addBands(imB2).addBands(imB3).addBands(imB4);
var imageTotale = imageImtermediaire.select(['first','first_1','first_2','first_3'],['B1','B2','B3','B4']);
var B1divB3 = imB1.divide(imB3).multiply(1000).round().divide(1000).rename('B1divB3');
var B2divB3 = imB2.divide(imB3).multiply(1000).round().divide(1000).rename('B2divB3');
var B3divB4 = imB3.divide(imB4).multiply(1000).round().divide(1000).rename('B3divB4');
var B1divB4 = imB1.divide(imB4).multiply(1000).round().divide(1000).rename('B1divB4');
var B2divB4 = imB2.divide(imB4).multiply(1000).round().divide(1000).rename('B2divB4');
var img = B1divB3.addBands(B2divB3).addBands(B3divB4).addBands(B1divB4).addBands(B2divB4);
return img;
};


// Global function

var MainLakeColor = function (lakes,imageCollection) {
 return getColorsRate(meanLakeColor(lakes,imageFiltered(imageCollection)));
 };


// Display test

Map.addLayer(MainLakeColor(lake288,Landsat8Collection));
Map.addLayer(lake288,{}, 'lacs');