// Date filter values

var start = ee.Date('2016-06-01');
var end = ee.Date('2016-07-15');


//Mask to get the lakes in the test
var someLakes = lake288.filterBounds(geometry);
var lakesImage = someLakes
   .reduceToImage({
    properties: ['OBJECTID'],
    reducer: ee.Reducer.firstNonNull()
});
var lakeMask = ee.Image(lakesImage).mask();

var justLake = function(image) {
  return image
  .updateMask(lakeMask)
  ;
};



// This function masks non-water pixels.

var lakesByLandsat8TOA = Landsat8Collection
  .filterDate(start, end)
  .filterBounds(geometry)
  .filterBounds(lake288)
  .map(justLake);

var land_water = function(image){
     //var bands_256 = image.expression(
     //"b('B4') >= 1500 && b('B4') <= 8500 && b('B3') >= 0 && b('B3') <= 1500 && b('B1') >= 1500 && b('B1') <= 5500");
    var maks_band = image.select('fmask');
    var mask_band = maks_band.updateMask(maks_band.eq(1));//.updateMask(bands_256)
    return image.updateMask(mask_band);
  };



// Function applying the masks on the Landsat 8 images. 

var imageFiltered = function(imageCollection){
  return (imageCollection)
 .filterDate(start,end)
 //filtre pour les tests
 .filterBounds(geometry)
 .filterBounds(lake288)
 .map(justLake)
 .map(land_water)
 .mosaic();
};


// Function collecting the mean color of a lake

var meanLakeColor = function(feature,mosaic){

return ee.Image(mosaic).reduceRegions({
  collection: feature,
  reducer: ee.Reducer.mean(),
  scale: 30,
});
};



//À faire marcher
var getColorsRate = function(feature){
feature.reduceToImage({
    properties: ['B4','B3','B2','B1'],
    reducer: ee.Reducer.firstNonNull()
});
var B4 = ee.Number(feature.select(['B4']));
var B3 = ee.Number(feature.select(['B3']));
var B2 = ee.Number(feature.select(['B2']));
var B1 = ee.Number(feature.select(['B1']));
/*var B1divB3 = B1.divide(B3).multiply(1000).round().divide(1000);//.rename('B1divB3');
var B2divB3 = B2.divide(B3).multiply(1000).round().divide(1000);//.rename('B2divB3');
var B3divB4 = B3.divide(B4).multiply(1000).round().divide(1000);//.rename('B3divB4');
var B1divB4 = B1.divide(B4).multiply(1000).round().divide(1000);//.rename('B1divB4');
var B2divB4 = B2.divide(B4).multiply(1000).round().divide(1000);//.rename('B2divB4');
//var img = B1divB3.addBands(B2divB3).addBands(B2divB3).addBands(B1divB4).addBands(B2divB4);
};*/


// TEST

// variables pour les tests

var LakesColor = imageFiltered(Landsat8Collection);

var meanLakesColor = meanLakeColor(someLakes,LakesColor);

var newFeature = getColorsRate(meanLakesColor);


// Display test


Map.addLayer(newFeature);
//Map.addLayer(LakesColor,imageVisParamLandsat,'Test');
//Map.addLayer(imageLandsat,imageVisParamLandsatMean,'Lacs par Landsat' );
//Map.addLayer(lake288.filterBounds(geometry),{}, 'lacs');









