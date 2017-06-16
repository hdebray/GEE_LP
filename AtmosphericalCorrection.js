//Load a Landsat 8 ImageCollection for a single path-row.
var image = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
.filter(ee.Filter.eq('WRS_PATH', 44))
.filter(ee.Filter.eq('WRS_ROW', 34))
.filterDate('2014-01-01', '2014-01-19')
.mosaic();



var sunElevation = image.select('SUN_ELEVATION');
var sunAzimuth = image.select('SUN_AZIMUTH');
var earthSunDistance = image.select('EARTH_SUN_DISTANCE');

// function ray_tau
// computes Rayleigh optical thickness for wl in microns
// QV 2016-12-14 

var ray_tau = function(wl, Patm=1013.25){
     var tau_ray = Patm/1013.25*(0.008569*Math.pow(wl,-4)*(1.+0.0113*Math.pow(wl,-2)+0.00013*Math.pow(wl,-4)));
    return tau_ray
    ;
};

// function ray_phase
// computes Rayleigh phase function for given geometry
// QV 2016-12-14

var ray_phase = function(theta_0,theta_v,phi_0, phi_v){
    
    var costheta_min = -1. * Math.cos(theta_0)*Math.cos(theta_v) - Math.sin(theta_0)*Math.sin(theta_v)*Math.cos(Math.abs(phi_0-phi_v));
    var costheta_plus = 1. * Math.cos(theta_0)*Math.cos(theta_v) - Math.sin(theta_0)*Math.sin(theta_v)*Math.cos(Math.abs(phi_0-phi_v));
    var phase_r= (0.75*(1.+Math.pow(Math.costheta_min,2.)))+(sky_refl(theta_0)+sky_refl(theta_v))*(0.75*(1.+Math.pow(costheta_plus,2.)));
               
    return phase_r
    ;
};


// function ray_tr
// computes Rayleigh transmittance for given geometry
// QV 2016-12-14

var ray_tr = function(wl, theta_0, theta_v, Patm=1013.25){

    var tau_ray = ray_tau(wl, Patm=Patm);
    var ray_tr = (1.+Math.exp(-1.*tau_ray/Math.cos(theta_v))) * (1.+exp(-1.*tau_ray/Math.cos(theta_0))) / 4.;
    return ray_tr
    ;
};


// function ray_refl
// computes Rayleigh reflectance for given geometry
// QV 2016-12-14

var ray_refl = function(wl, theta_0, theta_v, phi_0, phi_v, Patm=1013.25, tau_ray=None){
    
    if (tau_ray is None) { 
    	var tau_ray = ray_tau(wl, Patm=Patm)};
    var phase_ray = ray_phase(theta_0,theta_v,phi_0, phi_v);
    var rho_ray = (tau_ray * phase_ray) / (4. * Math.cos(theta_0)*Math.cos(theta_v));
    return rho_ray
    ;
};

// function sky_refl
// computes diffuse sky reflectance
// QV 2016-12-14

var sky_refl = function(theta, n_w=1.34){
    
    // angle of transmittance theta_t for air incident rays (Mobley, 1994 p156)
    var theta_t = Math.asin(1./n_w*Math.sin(theta));
    var r_int=0.5*(Math.pow(Math.sin(theta-theta_t)/Math.sin(theta+theta_t),2)+Math.pow(Math.tan(theta-theta_t)/Math.tan(theta+theta_t),2));
    return r_int
    ;
};


// function ray_phase_nosky
// computes Rayleigh phase function for given geometry (no diffuse sky reflectance)
// QV 2016-12-14

var ray_phase_nosky = function(theta_0,theta_v,phi_0, phi_v){
    
    var costheta_min = -1. * Math.cos(theta_0)*Math.cos(theta_v) - Math.sin(theta_0)*Math.sin(theta_v)*Math.cos(Math.abs(phi_0-phi_v));
    var phase_r= (0.75*(1.+Math.pow(costheta_min,2.)));
    return phase_r;
    ;
};

// function ray_refl_nosky
// computes Rayleigh reflectance for given geometry (no diffuse sky reflectance)
// QV 2016-12-14

var ray_refl_nosky = function(wl, theta_0, theta_v, phi_0, phi_v, Patm=1013.25, tau_ray=None){
    
    if (tau_ray is None){
     var tau_ray = ray_tau(wl, Patm=Patm);};
    var phase_ray = ray_phase_nosky(theta_0,theta_v,phi_0, phi_v);
    var rho_ray = (tau_ray * phase_ray) / (4. * Math.cos(theta_0)*Math.cos(theta_v));
    return rho_ray
    ;
};