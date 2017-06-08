GEE_LP.js

// Filter the 4 Canadian Ecozones which interrest us.

var borealShield = ecozonesCanadaFC.filter(ee.Filter.eq('name', 'Boreal Shield'));
var atlanticMaritime = ecozonesCanadaFC.filter(ee.Filter.eq('name', 'Atlantic Maritime'));
var atlanticHighlands = ecozonesCanadaFC.filter(ee.Filter.eq('name', 'Atlantic Highlands'));
var mixedwoodPlains = ecozonesCanadaFC.filter(ee.Filter.eq('name', 'Mixedwood Plains'));


// variable test

var someLakes = lake288.filterBounds(geometry);


// Date filter values

var start = ee.Date('2016-06-01');
var end = ee.Date('2016-07-15');

// Fmask classification values
 
var FMASK_CLOUD = 4;
var FMASK_CLOUD_SHADOW = 2;


// Mask of the lakes

var lakesImage = someLakes
   .reduceToImage({
    properties: ['OBJECTID'],
    reducer: ee.Reducer.firstNonNull()
});
var lakeMask = ee.Image(lakesImage).mask();


// This function masks non-lake's pixels.

var justLake = function(image) {
  return image
  .updateMask(lakeMask)
  ;
};


// This function masks cloudy pixels in a image.

var cloudMask = function (image){
  var fmask = image.select('fmask');
  var cloudMask_fmask = fmask
.neq(FMASK_CLOUD)
.and(fmask.neq(FMASK_CLOUD_SHADOW));
return image.updateMask(cloudMask_fmask);
};


// Function applying the masks on the Landsat 8 images. 

var imageFiltered = function(imageCollection){
  return cloudMask(imageCollection
 .filterBounds(geometry)
 .filterDate(start,end)
 .map(justLake)
 .mosaic());
};

// Function collecting the mean color of a lake

var meanLakeColor = function(feature,image){

return image.reduceRegions({
  collection: feature,
  reducer: ee.Reducer.mean(),
  scale: 30,
});

};

// Display

var imageLandsat = ee.ImageCollection
 (imageFiltered
 (Landsat8Collection))
 .reduce(ee.Reducer.mean());
 
// variables tests

var meanLakesColor = meanLakeColor(someLakes,imageLandsat);
// This function divide to number and deals with masked values
var divide = function(number1,number2){
  if (typeof number1 != 'Float') 
  return -1;
  else {
    return ee.Number(number1).divide(number2);
  }
};
 
// This function creates a new feature with the different colors rate.
var getColorsRate = function(feature) {
  // Add this list of properties.
  //var Blue1 = feature.get('B1_mean');
  var Blue2 = feature.get('B2_mean');
  //var Green = feature.get('B3_mean');
  var Red = feature.get('B4_mean');
  //var Blue1GreenRate = ee.Number(Blue1).divide(Green);
  //var Blue2GreenRate = ee.Number(Blue2).divide(Green);
  //var GreenRedRate = ee.Number(Green).divide(Red);
  //var Blue1RedRate = ee.Number(Blue1).divide(Red);
  var Blue2RedRate = divide(Blue2,Red);
  // Return a new Feature, copying properties from the old Feature.
  return feature.set({'Blue2RedRate' : Blue2RedRate});
};


var newFeature = meanLakesColor.map(getColorsRate);
print(newFeature);

//Map.addLayer(imageLandsat,imageVisParamLandsatMean,'Lacs par Landsat' );
//Map.addLayer(lake288.filterBounds(geometry),{}, 'lacs');
//Map.addLayer(BV288.filterBounds(geometry),{}, 'BV');


/*
//We apply the mask on the Sentinel 2 images and display them
var imageSentinel = Sentinel2Collection
 .filterBounds(lake288)
 .filterDate(start,end)
 .map(justLake)
 ;
 

var fmask = imageSentinel.select('fmask');
var cloudMask_fmaskSentinel = fmask
  .neq(FMASK_CLOUD)
  .and(fmask.neq(FMASK_CLOUD_SHADOW));
var imageSentinelMasked = imageSentinel.updateMask(cloudMask_fmaskSentinel);
 
Map.addLayer(imageSentinelMasked,imageVisParamSentinel,'Lacs par Sentinel' );

*/







