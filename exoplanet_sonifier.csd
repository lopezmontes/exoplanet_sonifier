<CsoundSynthesizer>
<CsInstruments>
sr      = 44100
ksmps   = 16
nchnls  = 4

; instr 1 is an always-on score activated instrument that 
; exists mainly to get "control" message values from [csound~].
;
; instr 2 is an FM MIDI instrument.
;
; instr 3 is a score activated FM instrument.
;
; instr 4 is an always-on score activated Effects instrument.
; It processes audio from instr 2, 3 with a reverb and flanger
; effect (respectively).

massign 0, 0 ; Disable default MIDI assignments.
massign 1, 2 ; Assign MIDI channel 1 to instr 2.
zakinit 2, 1 ; Create 2 a-rate zak channels and 1 k-rate zak channel.
giSine ftgen 1, 0, 16384, 10, 1 ; Generate a sine wave table.
giSine2 ftgen 2, 0, 16384, 10, 1, .6, .4, .3, .2, .16, .14, .13, .11, .1, .07, .06, .04, .03, .02 ; Generate a sine wave table.
giSine3 ftgen 3, 0, 16384, 10, 1, 0, .4, 0, .2, 0, .14, 0, .11, 0, .07, 0, .04, 0, .02 ; Generate a sine wave table.
giSine4 ftgen 4, 0, 1025, 10, 1, .5, .333, .25, .2, .166, .143, .125, .111, .1, .0909, .0833, .077 ; Sawtooth
giSine5 ftgen 5, 0,	1025, 10, 1, 0, .333, 0, .2, 0, .143, 0, .111, 0, .0909, 0, .077, 0, .0666, 0, .0588 ; Square wave
giSine6 ftgen 6, 0, 1025, 10, .8, .9, .95, .96, 1, .91, .8, .75, .6, .42, .5, .4, .33, .28, .2, .15; Pulse
giSine7 ftgen 7, 0, 4096, 11, 10, 1, .9; Pulse train
giSine8 ftgen 8, 0, 8192, 9, 21, 1, 0, 22, 1, 0, 25, 1, 0, 27, 1, 0, 31, 1, 0, 33, 1, 0, 34, 1, 0, 35, 1, 0; higher order partials
giSine9 ftgen 9, 0, 16384, 8, 1, 750, 0, 550, -1, 400, 0, 348, 1; stretched cosine


; Initialize MIDI control values. 
initc7 1, 1, 0
initc7 1, 2, .5
initc7 1, 3, .25
initc7 1, 4, .2

; Declare all "chn" channels.  Always declare channels in the header
; section.  Declaring is required for output channels.  If an output
; channel is not declared using chn_k, [csound~] will not output value
; pairs for that channel.
chn_k "car", 3      ; 3 = input + output
chn_k "mod", 3
chn_k "ndx", 3
chn_k "portTime", 1 ; 1 = input
chn_k "carX2", 2    ; 2 = output

; chnget instrument.  Always-on and score activated.
instr 1
    ; Get the values for "car", "mod", "ndx", and "portTime". 
    ; We are getting some of these values at i-rate as well as
    ; k-rate.  The i-rate values are needed for the portk opcodes.
    iCar  chnget "car"
    iMod  chnget "mod"
    iNdx  chnget "ndx" 
    gkCar chnget "car"
    gkMod chnget "mod"
    gkNdx chnget "ndx"
    kTim  chnget "portTime"

    ; We could put the chnget/chnset opcodes in the MIDI activated
    ; instrument (2), but then we would have redundant calls because
    ; it's polyphonic.

    ; Smooth out jumps.
    gkCar portk gkCar, kTim, iCar
    gkMod portk gkMod, kTim, iMod
    gkNdx portk gkNdx, kTim, iNdx

    chnset gkCar * 2, "carX2" ; Just demonstrates the chnset opcode.
endin

; Polyphonic FM instrument.  MIDI activated.
instr 2
    iCps cpsmidi
    iAmp veloc 0, 32768
    
    ; Generate the FM signal.
    aout foscil iAmp, iCps, gkCar, gkMod, gkNdx, giSine
    
    ; Read in MIDI cc's as normalized [0,1] values.
    iAtk midic7 1, 0, 1
    iDec midic7 2, 0, 1
    iSus midic7 3, 0, 1
    iRel midic7 4, 0, 1

    ; Make the MIDI knobs behave exponentially by squaring,
    ; then multiply by max length in seconds.
    iAtk = iAtk * iAtk * 3 + .001
    iDec = iDec * iDec * 3 + .001
    iSus = iSus * iSus + .001
    iRel = iRel * iRel * 4 + .001

    ; Generate and apply the envelope.
    aenv expsegr 0.001, iAtk, 1, iDec, iSus, iRel, 0.001
    aout = aout * aenv

    ; Mix into zak channel 1.
    zawm aout, 1
endin
    
; FM instrument.  Score activated.
instr 3
    kCar line p6, p3, p7
    kMod line p8, p3, p9
    kNdx line p10, p3, p11
    amp  linen .85, p3 * .5, p3, p3 * .5
    aout foscil p5, cpspch(p4), kCar, kMod, kNdx, giSine
    aout = aout * amp * .25

    ; Mix into zak channel 2.
    zawm aout, 2
endin

; Effects instrument.  Always-on and score activated.
instr 10
    aL zar 1      ; Read instr 2 audio.
    aR zar 2      ; Read instr 3 audio.
    denorm aL, aR ; Prevent CPU spikes on Intel processors.

    a1L, a1R freeverb aL, aR, .7, .2 ; Apply reverb effect.
    a2L = a1L * .3 + aL * .7       ; Mix dry and wet signals. */
    a2R = a1R * .3 + aR * .7       ; Mix dry and wet signals. */
    outch 1, a2L, 2, a2R
/* 
    aDel oscili .5, .69, giSine      ; LFO for flanger delay time
    aDel = (aDel + .5) * .04 + .06   ; Condition LFO signal.
    a3F flanger a3, aDel, .6         ; Apply flanger effect.
    a3F = a3F * .45 + a3 * .55       ; Mix dry and wet signals.
    outch 3, a3F, 4, a3F */

    zacl 0, 2  ; Clear audio channels to prevent audio build-up.
endin

; Exoplanets synth

instr 5
    imass = p3 ; planet mass
    idist = p4 ; distance to the planet
    isize = p5 ; planet size
    iorbp = p6 ; orbital period
    iecc = p7 ; orbital eccentricity
    idens = p8 ; planet density
    irecasc = p9
    istellarrad = p10
    istellarmas = p11
    istspectr = p12
    iwavetype = p13
    
    
	kenv linseg 0, idens, 1, imass * 0.5, 0.7, imass * 0.5 - idens, 0
	aAM oscili 1, iorbp, 1, 0.5; orbital period is AM
	aAM = aAM * 0.5
	aAM = aAM + 0.5
    aFM oscili istellarmas, istellarrad, istspectr

    aPoweredAM powershape aAM, iecc
	asig oscil idist * aPoweredAM, isize + aFM, iwavetype

    ; atack attached to planet density
    anoise rand idens * 5000
    knoiseenv expseg 0.00001, idens, 1, imass*.3, 0.00001
    attack reson knoiseenv * anoise, isize, 10, 2

    klastenv expseg 0.0001, idens, 1, p3-idens, 1
    aleft,aright pan2 asig*kenv*klastenv +  attack, irecasc
    zawm aleft, 1
    zawm aright, 2
endin

</CsInstruments>
<CsScore>

f0 36000
i1 0 36000 ; Activate the always-on chnget instrument.
i10 0 36000 ; Activate the Reverb/Flanger always-on instrument.
e

</CsScore>
</CsoundSynthesizer>





<bsbPanel>
 <label>Widgets</label>
 <objectName/>
 <x>100</x>
 <y>100</y>
 <width>320</width>
 <height>240</height>
 <visible>true</visible>
 <uuid/>
 <bgcolor mode="nobackground">
  <r>255</r>
  <g>255</g>
  <b>255</b>
 </bgcolor>
</bsbPanel>
<bsbPresets>
</bsbPresets>
