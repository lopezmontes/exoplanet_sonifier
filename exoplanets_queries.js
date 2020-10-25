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
Distancia: filtro
Estrella: modulación de frecuencia sobre el timbre del planeta:
    Radio: fundamental
    Masa: profundidad de la modulación
    Tipo espectral: forma de onda
    Luminosidad: filtro pasabajos para dar brillantez a la onda modulante 



*/

var exoplanets_catalogue = JSON.parse(fs.readFileSync('confirmed_exoplanets.json'));


maxAPI.addHandler('exoplanet', (n) => {
    exoplanetParameters = [
        exoplanets_catalogue.exoplanets[n].fpl_hostname,
        exoplanets_catalogue.exoplanets[n].fpl_letter,
        exoplanets_catalogue.exoplanets[n].fpl_name,
        exoplanets_catalogue.exoplanets[n].fpl_disc,
        exoplanets_catalogue.exoplanets[n].fpl_orbper,
        exoplanets_catalogue.exoplanets[n].fpl_smax,
        exoplanets_catalogue.exoplanets[n].fpl_eccen,
        exoplanets_catalogue.exoplanets[n].fpl_bmasse,
        exoplanets_catalogue.exoplanets[n].fpl_rade,
        exoplanets_catalogue.exoplanets[n].fpl_dens,
        exoplanets_catalogue.exoplanets[n].ra_str,
        exoplanets_catalogue.exoplanets[n].dec_str,
        exoplanets_catalogue.exoplanets[n].fst_dist,
        exoplanets_catalogue.exoplanets[n].fst_optmag,
        exoplanets_catalogue.exoplanets[n].fst_spt,
        exoplanets_catalogue.exoplanets[n].fst_lum,
        exoplanets_catalogue.exoplanets[n].fst_mass,
        exoplanets_catalogue.exoplanets[n].fst_rad,
        exoplanets_catalogue.exoplanets[n].fst_age,
    ]
    maxAPI.outlet(exoplanetParameters);
});