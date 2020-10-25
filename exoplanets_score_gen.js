const fs = require('fs');
const maxAPI = require('max-api');

// used tagged data for sonification
// see https://exoplanetarchive.ipac.caltech.edu/docs/API_compositepars_columns.html

/*
fpl_hostname 	Host Name 	                                Stellar name most commonly used in the literature.
fpl_letter 	    Planet Letter 	                            Letter assigned to the planetary component of a planetary system.
fpl_name 	    Planet Name 	                            Planet name most commonly used in the literature.
fpl_disc 	    Year of Discovery 	  (since 1989)          Year the planet was discovered
fpl_orbper	    Orbital Period (days)   (0.09 - 170000)     Time the planet takes to make a complete orbit around the host star or system.
fpl_smax 	    Orbit Semi-Major Axis (au) 	(0-3500)        The longest radius of an elliptic orbit, or, for exoplanets detected via gravitational microlensing or direct imaging, the projected separation in the plane of the sky.
fpl_eccen 	    Eccentricity 	        (0-0.95)            Amount by which the orbit of the planet deviates from a perfect circle.
fpl_bmasse 	    Planet Mass [Earth mass] (0-240000)         Best planet mass estimate available, in order of preference: Mass, M*sin(i)/sin(i), or M*sin(i), depending on availability, and measured in Earth masses. See Planet Mass M*sin(i) Provenance (fpl_bmassprov) to determine which measure applies. 
fpl_rade 	    Planet Radius [Earth radii] (0.3-77)        Length of a line segment from the center of the planet to its surface, measured in units of radius of the Earth.
fpl_dens 	    Planet Density (g/cm**3) 	                Amount of mass per unit of volume of the planet.
ra_str 	        RA 	                                        Right Ascension of the planetary system in decimal degrees.
dec_str 	    Dec                  	                    Declination of the planetary system in decimal degrees.
fst_dist 	    Distance [pc] 	       (1.3-8200)           Distance to the planetary system in units of parsecs.
fst_optmag 	    Optical Magnitude [mag] (2.9-20)	        Brightness of the host star as measured using V (Johnson), Gaia G-band, or Kepler-band in units of magnitudes.
fst_spt 	    Spectral Type 	                            Classification of the star based on their spectral characteristics following the Morgan-Keenan system.
fst_lum 	    Stellar Luminosity        (-6-3.28)      	Amount of energy emitted by a star per unit time, measured in units of solar luminosities.
fst_mass 	    Stellar Mass [Solar mass] (0.001-11)        Amount of matter contained in the star, measured in units of masses of the Sun.
fst_rad 	    Stellar Radius [Solar radii]  (0.01-85)     Length of a line segment from the center of the star to its surface, measured in units of radius of the Sun. 
fst_age 	    Stellar Age [Gyr] 	  (0.001-15)            The age of the host star.
*/

/* Ideas para sonificación:
GLOBALES
Variable global para el tiempo
Marcación de una región del cielo
Activación de variables de la sonificación para centrarse sólo en algunos parámetros
Edad estelar: para hacer un timeline de activación

INDIVIDUALES
Periodo orbital planeta: modulación de amplitud y espacialización
Excentricidad: modulación de frecuencia que asocie a la velocidad orbital
Frecuencia fundamental: tamaño del planeta
Densidad: timbre y ataque
Magnitud óptica: intensidad relativa para la espacialización
Distancia: intensidad
Estrella: modulación de frecuencia sobre el timbre del planeta:
    Radio: fundamental
    Masa: profundidad de la modulación
    Tipo espectral: forma de onda
    Luminosidad: filtro pasabajos para dar brillantez a la onda modulante 



*/

var exoplanets_catalogue = JSON.parse(fs.readFileSync('confirmed_exoplanets.json'));
var planetDur = 1;


function convertRange(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
};

  
function flexiRescale (value, oldmin, oldmax, newMin, newMax, exponent) {
    var min = Math.min(oldmax,oldmin);
    var max = Math.max(oldmax,oldmin);
    value = (value - min) / (max - min) + 0;
    if (oldmin > oldmax) { value = 1 - value };
    value = Math.pow(value, exponent);
    return (newMax - newMin) * (value - 0) / 1 + newMin;
};

flexiRescale (2, 10, 0, 0, 2000, 3);


maxAPI.addHandler('planetDurBaseline', (d) => {
    planetDur = d;
});

maxAPI.addHandler('exoplanet', (n) => {
    var planetSonifiable = true;

    var host = exoplanets_catalogue.exoplanets[n].fpl_hostname;
    var letter = exoplanets_catalogue.exoplanets[n].fpl_letter;
    var name = exoplanets_catalogue.exoplanets[n].fpl_name;
    var disc = exoplanets_catalogue.exoplanets[n].fpl_disc;
    var orbp = exoplanets_catalogue.exoplanets[n].fpl_orbper;
    var smax = exoplanets_catalogue.exoplanets[n].fpl_smax;
    var ecc = exoplanets_catalogue.exoplanets[n].fpl_eccen;
    var bmas = exoplanets_catalogue.exoplanets[n].fpl_bmasse;
    var rad = exoplanets_catalogue.exoplanets[n].fpl_rade;
    var den = exoplanets_catalogue.exoplanets[n].fpl_dens;
    var rastr = exoplanets_catalogue.exoplanets[n].ra_str;
    var decstr = exoplanets_catalogue.exoplanets[n].dec_str;
    var dist = exoplanets_catalogue.exoplanets[n].fst_dist;
    var omag = exoplanets_catalogue.exoplanets[n].fst_optmag;
    var spt = exoplanets_catalogue.exoplanets[n].fst_spt;
    var lum = exoplanets_catalogue.exoplanets[n].fst_lum;
    var mass = exoplanets_catalogue.exoplanets[n].fst_mass;
    var srad = exoplanets_catalogue.exoplanets[n].fst_rad;
    var age =  exoplanets_catalogue.exoplanets[n].fst_age;  
    if (disc === null ) { disc = 0 }; 
    if (orbp === null ) { orbp = 0 }; 
    if (smax === null ) { smax = 0 }; 
    if (ecc  === null) { ecc =  0 }; 
    if (bmas === null ) { bmas = 0 }; 
    if (bmas > 100 ) { bmas = 100 }; 
    if (rad  === null) { planetSonifiable = false }; 
    if (den  === null) { den =  0 }; 
    if (dist === null ) { dist = 1000 }; 
    if (omag === null ) { omag = 0 }; 
    if (spt  === null) { spt = 0 }; 
    if (lum  === null) { lum =  0 }; 
    if (mass === null ) { mass = 0 }; 
    if (srad === null ) { srad = 0 }; 
    if (age  === null) { age =  0 };  
    rectasc = parseInt(rastr.substring(0,2));
    // mapping 
    // rad (0-77) -> (20000-20) 
    // dist (0-8200)
    // 
    if (planetSonifiable == false) return;
    maxAPI.outlet([
        "e",
        "i5",
        0,
        flexiRescale(bmas,0,100,planetDur*4,planetDur*20,.6),
        flexiRescale(dist,8200,0,0,6000,2),
        flexiRescale(rad,77,0,20,4000,30),
        flexiRescale(orbp,1000,0,0.1,20,10),
        flexiRescale(ecc,0,1,1,100,2),
        flexiRescale(den,15,0,0,3,7),
        flexiRescale(rectasc,0,24,0,1,1),
        flexiRescale(srad,85,0,0,80,1.3),
        flexiRescale(mass,0,11,0,8000,1.3),
        Math.ceil(Math.random()*9),
        Math.ceil(Math.random()*9)

    ]);
});


flexiRescale(240000,0,1000,8,50,.6);

flexiRescale(5400,8200,0,0,6000,2);
flexiRescale(.3,77,0,0,5000,40);

flexiRescale(560,1000,0,0.1,40,10);
flexiRescale(0.9,0,1,1,100,2);
flexiRescale(1,15,0,0,3,10);
flexiRescale(200,0,1000,10,300,1);


flexiRescale(4,77,0,20,7000,20);
