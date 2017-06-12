// Date filter values

var start = ee.Date('2016-06-01');
var end = ee.Date('2016-07-15');


//Mask to get the lakes

var land_water = ee.ImageCollection('LANDSAT/LC8_SR')
  .map(function(image) {
    var maks_band = image.select('cfmask');
    return  maks_band.updateMask(maks_band.eq(1));
  }).filterBounds(lake288).filterBounds(geometry).median();


// This function masks non-water pixels.

var justLake = function(image) {
  return image
  .updateMask(land_water)
  ;
};


// Function applying the masks on the Landsat 8 images. 

var imageFiltered = function(image){
  return ee.ImageCollection(image)
 .filterDate(start,end)
 //filtre pour les tests
 .filterBounds(geometry)
 .map(justLake)
 .mosaic();
};


// Function collecting the mean color of a lake

var meanLakeColor = function(feature,image){

return image.reduceRegions({
  collection: feature,
  reducer: ee.Reducer.mean(),
  scale: 30,
});
};


// variables pour les tests

var imageLandsat = ee.Image
 (Landsat8Collection.map(imageFiltered))
 .reduce(ee.Reducer.mean());

var B4 = land_water.select('B4');
var B1 = land_water.select('B1');
var B3 = land_water.select('B3');
var B5 = land_water.select('B5');
var B1divB3 = B1.divide(B3).multiply(1000).round().divide(1000).rename('B1divB3');
var B4divB5 = B4.divide(B5).multiply(1000).round().divide(1000).rename('B4divB5');


// TEST

var justLakes = Landsat8Collection.map(justLake)

//var LakesColor = imageFiltered(justLakes);

//var meanLakesColor = meanLakeColor(someLakes,imageLandsat);

//var newFeature = meanLakesColor.map(getColorsRate);


// Display

Map.addLayer(justLakes)
//Map.addLayer(imageLandsat,imageVisParamLandsatMean,'Lacs par Landsat' );
//Map.addLayer(lake288.filterBounds(geometry),{}, 'lacs');




var B4 = land_water.select('B4');
var B1 = land_water.select('B1');
var B3 = land_water.select('B3');
var B5 = land_water.select('B5');
var B1divB3 = B1.divide(B3).multiply(1000).round().divide(1000).rename('B1divB3');
var B4divB5 = B4.divide(B5).multiply(1000).round().divide(1000).rename('B4divB5');