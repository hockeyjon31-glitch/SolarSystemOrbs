import { CelestialBodyData } from '../types';

export const CELESTIAL_BODIES: Record<string, CelestialBodyData> = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    subtitle: 'Luna — Earth\'s Only Natural Satellite',
    classification: 'Natural Satellite (Major Moon)',
    parentBody: 'Earth (384,400 km orbital radius)',
    equatorialRadiusKm: 1737.4,
    relativeRadiusEarth: 0.2727,
    relativeScaleDisplay: 0.52,
    surfaceGravity: 1.62,
    relativeGravityEarth: 0.165,
    rotationPeriodHours: 655.7, // 27.32 days (synchronous tidal lock)
    rotationPeriodDesc: '27.32 Earth Days (Tidally Locked to Earth)',
    isRetrograde: false,
    axialTiltDeg: 1.54,
    meanTempC: -20, // range -130°C to +120°C
    surfacePressureBar: 0.0000000000003,
    surfacePressureDesc: 'Near-vacuum exosphere (3 × 10⁻¹⁵ bar)',
    atmosphericComposition: [
      { gas: 'Helium (He)', percentage: '40%' },
      { gas: 'Neon (Ne)', percentage: '40%' },
      { gas: 'Hydrogen (H₂)', percentage: '10%' },
      { gas: 'Argon & Sodium traces', percentage: '<10%' }
    ],
    colorHex: '#9ca3af',
    glowColorHex: '#cbd5e1',
    hasAtmosphereGlow: false,
    atmosphereThickness: 0,
    summary: 'The Moon is an ancient, heavily cratered world devoid of liquid water and air. Its face features bright feldspar-rich highlands and dark, smooth volcanic basalt maria forged by ancient asteroid cataclysms and subsequent lava inundations.',
    geologyHighlights: [
      'Synchronously locked: The same lunar hemisphere forever faces Earth.',
      'Lunar Maria: Vast plains formed by early volcanic flood basalts filling impact basins.',
      'Regolith: Pulverized micro-meteorite glass and basalt dust blanket several meters deep.',
      'South Pole–Aitken Basin: One of the largest preserved impact structures in the Solar System (2,500 km across).'
    ],
    missions: [
      'Apollo 11 (1969): First human lunar landing at Mare Tranquillitatis',
      'Apollo 17 (1972): Final Apollo mission, long rover excursions in Taurus-Littrow',
      'Lunar Reconnaissance Orbiter (LRO): Continuous sub-meter topographic mapping',
      'Artemis & Chang\'e programs: Lunar south pole water-ice prospecting and far-side sample returns'
    ],
    surfaceModesAvailable: [
      { mode: 'natural', label: 'Visible Surface', description: 'Ancient anorthosite highlands, dark basalt maria, and impact ray craters.' }
    ],
    features: [
      {
        id: 'apollo11',
        name: 'Tranquility Base (Apollo 11)',
        type: 'landing_site',
        lat: 0.67,
        lon: 23.47,
        description: 'First crewed lunar landing site where Neil Armstrong and Buzz Aldrin stepped onto lunar soil on July 20, 1969.',
        significance: 'Historic human milestone; proved basaltic lunar dust could support landing gear and astronauts.',
        missionConnection: 'Apollo 11 Lunar Module "Eagle"',
        elevationOrDepth: '-1.4 km'
      },
      {
        id: 'tycho',
        name: 'Tycho Crater',
        type: 'crater',
        lat: -43.3,
        lon: -11.2,
        description: 'A prominent 85-km-wide impact crater featuring brilliant ejecta rays extending over 1,500 kilometers across the lunar disc.',
        significance: 'Relatively young crater (~108 million years old), its ejecta rays define the southern lunar highlands.',
        elevationOrDepth: '4.8 km deep'
      },
      {
        id: 'copernicus',
        name: 'Copernicus Crater',
        type: 'crater',
        lat: 9.6,
        lon: -20.1,
        description: 'A 93-km-wide impact crater with stepped terraced walls and multiple central peaks rising 1.2 km above the crater floor.',
        significance: 'Classic archetype of a complex lunar impact crater in eastern Oceanus Procellarum.',
        elevationOrDepth: '3.8 km deep'
      },
      {
        id: 'oceanus_procellarum',
        name: 'Oceanus Procellarum',
        type: 'plain',
        lat: 18.4,
        lon: -57.4,
        description: 'The Ocean of Storms: the largest lunar mare, spanning over 2,500 km from north to south, filled with tholeiitic basalt.',
        significance: 'Dominates the western lunar near side, covering over 4 million square kilometers.',
        elevationOrDepth: '-2.1 km average'
      },
      {
        id: 'mare_imbrium',
        name: 'Mare Imbrium (Sea of Rains)',
        type: 'plain',
        lat: 32.8,
        lon: -15.6,
        description: 'A colossal 1,145-km-wide circular lava plain ringed by the Montes Apenninus mountain range.',
        significance: 'Formed from a proto-planet collision 3.85 billion years ago, subsequently flooded with magma.',
        elevationOrDepth: '-3.0 km'
      },
      {
        id: 'south_pole_aitken',
        name: 'South Pole–Aitken Basin',
        type: 'crater',
        lat: -70.0,
        lon: 170.0,
        description: 'Massive far-side impact basin spanning 2,500 km across and up to 13 km deep, exposing lower lunar crust.',
        significance: 'Primary target for future human exploration due to shadowed polar craters harboring water ice.',
        elevationOrDepth: '-8.2 km'
      }
    ],
    internalLayers: [
      { name: 'Crust (Anorthosite & Basalt)', depth: '0 – 50 km', composition: 'Silicates, plagioclase feldspar, pyroxene', color: '#a8a29e', radiusPercent: 1.0, description: 'Crushed and fractured impact regolith over ancient buoyant anorthositic rock.' },
      { name: 'Upper & Middle Mantle', depth: '50 – 1,000 km', composition: 'Olivine and orthopyroxene rich rock', color: '#78716c', radiusPercent: 0.88, description: 'Rigid lithosphere cooling since the primordial magma ocean solidified.' },
      { name: 'Partial Melt Boundary', depth: '1,000 – 1,400 km', composition: 'Partially molten silicate layer', color: '#b45309', radiusPercent: 0.42, description: 'Deep seismic attenuation zone heated by tidal friction.' },
      { name: 'Fluid Outer & Solid Inner Core', depth: '1,400 – 1,737 km', composition: 'Metallic iron-nickel alloy with sulfur', color: '#f59e0b', radiusPercent: 0.20, description: 'Compact metallic core (approx. 330 km radius), small fraction of lunar mass.' }
    ]
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    subtitle: 'The Red Planet — Fourth World from the Sun',
    classification: 'Terrestrial Planet',
    parentBody: 'The Sun (1.524 AU / 227.9 million km)',
    equatorialRadiusKm: 3389.5,
    relativeRadiusEarth: 0.532,
    relativeScaleDisplay: 0.76,
    surfaceGravity: 3.72,
    relativeGravityEarth: 0.379,
    rotationPeriodHours: 24.62, // 24h 37m 22s
    rotationPeriodDesc: '24 Hours 37 Minutes (1 Martian Sol)',
    isRetrograde: false,
    axialTiltDeg: 25.19, // Earth is 23.44°!
    meanTempC: -63, // range -140°C to +20°C
    surfacePressureBar: 0.00636,
    surfacePressureDesc: '0.0064 bar (0.6% of Earth sea-level pressure)',
    atmosphericComposition: [
      { gas: 'Carbon Dioxide (CO₂)', percentage: '95.3%' },
      { gas: 'Nitrogen (N₂)', percentage: '2.6%' },
      { gas: 'Argon (Ar)', percentage: '1.9%' },
      { gas: 'Oxygen & Water Vapor', percentage: '0.2%' }
    ],
    colorHex: '#dc2626',
    glowColorHex: '#f87171',
    hasAtmosphereGlow: true,
    atmosphereThickness: 0.03,
    summary: 'A freeze-dried desert world hosting the Solar System\'s grandest canyons and tallest volcanoes. Mars possesses ancient riverbeds and frozen lakes, indicating a warmer, wetter early epoch with a thicker shielding atmosphere.',
    geologyHighlights: [
      'Twin polar ice caps: Permanent water-ice shields overlaid with seasonal carbon dioxide dry ice.',
      'Olympus Mons: Shield volcano 2.5 times the height of Mount Everest.',
      'Valles Marineris: Chasm system stretching across a quarter of the Martian equator.',
      'Global Dust Storms: Envelop the entire globe every few Martian years due to intense solar heating.'
    ],
    missions: [
      'Viking 1 & 2 (1976): First successful prolonged surface operations and biology tests',
      'Mars Pathfinder & Sojourner (1997): First roving exploration vehicle',
      'Curiosity & Perseverance Rovers (2012, 2021): Searching for biosignatures in ancient lake basins',
      'MRO, Mars Express, Hope: High-resolution orbital imaging, radar soundings, atmospheric probes'
    ],
    surfaceModesAvailable: [
      { mode: 'natural', label: 'Visible Red Surface', description: 'Oxidized iron-rich regolith, dark basalt plains, and polar ice sheets.' }
    ],
    features: [
      {
        id: 'olympus_mons',
        name: 'Olympus Mons',
        type: 'volcano',
        lat: 18.65,
        lon: -133.8,
        description: 'The largest planetary volcano known in the Solar System, standing 21.9 km high and 600 km wide.',
        significance: 'Formed from millions of years of basaltic effusive lava flows over a stationary crustal hotspot.',
        missionConnection: 'Photographed in detail by Viking, Mars Global Surveyor, and MRO',
        elevationOrDepth: '+21.9 km elevation'
      },
      {
        id: 'valles_marineris',
        name: 'Valles Marineris',
        type: 'canyon',
        lat: -14.0,
        lon: -59.2,
        description: 'Vast canyon labyrinth spanning 4,000 km in length, up to 200 km wide, and plunging 7 km deep into the Martian crust.',
        significance: 'A tectonic rift system formed as the nearby Tharsis volcanic bulge swelled and cracked the crust.',
        elevationOrDepth: '-7.0 km depth'
      },
      {
        id: 'jezero_crater',
        name: 'Jezero Crater',
        type: 'landing_site',
        lat: 18.38,
        lon: 77.58,
        description: 'A 45-km-wide impact crater featuring a preserved river delta where Perseverance is hunting for ancient microbial fossils.',
        significance: 'Host of NASA\'s Perseverance rover and the historic Ingenuity Mars Helicopter flights.',
        missionConnection: 'NASA Mars 2020 Perseverance Rover',
        elevationOrDepth: '-2.5 km'
      },
      {
        id: 'syrtis_major',
        name: 'Syrtis Major Planum',
        type: 'plain',
        lat: 8.4,
        lon: 69.5,
        description: 'A dark, low-relief volcanic basalt shield plain, the first surface feature identified on another planet by Christiaan Huygens in 1659.',
        significance: 'Historic rotational landmark used to calculate the Martian day length.',
        elevationOrDepth: '+1.0 km'
      },
      {
        id: 'planum_boreum',
        name: 'Planum Boreum (North Polar Cap)',
        type: 'mountain',
        lat: 84.0,
        lon: 0.0,
        description: 'Vast dome of layered water ice and silicate dust over 1,000 km in diameter and 3 km thick, sculpted by catabatic spiral wind troughs.',
        significance: 'Contains a stratified million-year climatic record of Martian orbital cycles.',
        elevationOrDepth: '+3.0 km'
      },
      {
        id: 'gale_crater',
        name: 'Gale Crater & Mount Sharp',
        type: 'landing_site',
        lat: -5.4,
        lon: 137.8,
        description: 'Impact crater harboring Mount Sharp (Aeolis Mons), a 5.5-km-high central sedimentary peak explored by the Curiosity rover.',
        significance: 'Proved ancient Mars had persistent fresh-water lake systems habitable for microbial life.',
        missionConnection: 'NASA Curiosity Rover (MSL)',
        elevationOrDepth: '-4.5 km to +5.5 km'
      }
    ],
    internalLayers: [
      { name: 'Silicate Crust', depth: '0 – 50 km', composition: 'Iron-rich volcanic basalt and weathering products', color: '#c2410c', radiusPercent: 1.0, description: 'Single contiguous tectonic plate without active continental drift.' },
      { name: 'Silicate Mantle', depth: '50 – 1,560 km', composition: 'Olivine, garnet, pyroxene rich rock', color: '#9a3412', radiusPercent: 0.85, description: 'Stiff mantle layer retaining fossil heat from early accretion.' },
      { name: 'Molten Metallic Core', depth: '1,560 – 3,390 km', composition: 'Liquid iron, nickel, with 15–18% lighter sulfur', color: '#f97316', radiusPercent: 0.54, description: 'InSight seismic data confirmed a large, liquid core (~1,830 km radius).' }
    ]
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    subtitle: 'Earth\'s Scorching Twin — Second World from the Sun',
    classification: 'Terrestrial Planet',
    parentBody: 'The Sun (0.723 AU / 108.2 million km)',
    equatorialRadiusKm: 6051.8,
    relativeRadiusEarth: 0.949,
    relativeScaleDisplay: 1.0,
    surfaceGravity: 8.87,
    relativeGravityEarth: 0.904,
    rotationPeriodHours: -5832.5, // -243.02 days, retrograde!
    rotationPeriodDesc: '243 Earth Days (Retrograde / Clockwise Rotation)',
    isRetrograde: true,
    axialTiltDeg: 177.36, // effectively upside down! (2.64° tilt)
    meanTempC: 464, // hottest planet!
    surfacePressureBar: 92.0,
    surfacePressureDesc: '92 bar (~90 atmospheres, equivalent to 900m ocean depth)',
    atmosphericComposition: [
      { gas: 'Carbon Dioxide (CO₂)', percentage: '96.5%' },
      { gas: 'Molecular Nitrogen (N₂)', percentage: '3.5%' },
      { gas: 'Sulfur Dioxide (SO₂)', percentage: '150 ppm' },
      { gas: 'Sulfuric Acid Droplets', percentage: 'Cloud decks' }
    ],
    colorHex: '#eab308',
    glowColorHex: '#fef08a',
    hasAtmosphereGlow: true,
    atmosphereThickness: 0.05,
    summary: 'A hellish inferno dominated by a runaway greenhouse effect. While almost identical to Earth in size and mass, its crushing 92-bar carbon dioxide atmosphere traps intense solar heat, baking basaltic volcanic plains under thick clouds of concentrated sulfuric acid.',
    geologyHighlights: [
      'Retrograde rotation: Rotates backwards extremely slowly; one Venusian day exceeds its 224.7-day orbital year.',
      'Super-rotating atmosphere: Cloud canopy whips around the planet in just 4 Earth days (360 km/h wind speeds).',
      'Volcanic Plains: 80% of the surface consists of smooth volcanic basalt sheets resurfaced 300–500 million years ago.',
      'Radar-Penetrating Topography: Synthetic aperture radar from Magellan mapped continent-sized highlands and 11-km peaks.'
    ],
    missions: [
      'Venera 7, 9, 13 (1970-1982): Soviet landers; first telemetry and color panoramic photos from the surface',
      'Magellan (1990-1994): NASA radar orbiter mapped 98% of the surface at 100m resolution',
      'Venus Express & Akatsuki: Orbital tracking of atmospheric super-rotation and nightside airglow',
      'Upcoming DAVINCI & VERITAS (NASA) and EnVision (ESA): High-resolution radar and atmospheric probe'
    ],
    surfaceModesAvailable: [
      { mode: 'natural', label: 'Atmospheric Cloud Deck', description: 'Opaque sulfur dioxide and sulfuric acid aerosol clouds with subtle UV banding.' },
      { mode: 'radar_surface', label: 'Magellan Radar Topography', description: 'Radar-derived false-color rocky surface revealing volcanic mountains, lava channels, and highlands.' }
    ],
    features: [
      {
        id: 'maxwell_montes',
        name: 'Maxwell Montes',
        type: 'mountain',
        lat: 65.2,
        lon: 3.3,
        description: 'The highest mountain massif on Venus, towering 11 kilometers above the average planetary radius in Ishtar Terra.',
        significance: 'Highly reflective to radar signals due to metallic semiconductor frost (possibly bismuthinite or lead sulfide).',
        elevationOrDepth: '+11.0 km peak'
      },
      {
        id: 'aphrodite_terra',
        name: 'Aphrodite Terra',
        type: 'plain',
        lat: -5.8,
        lon: 104.8,
        description: 'The largest highland continent on Venus, roughly the size of Africa, featuring complex rift valleys and fractures.',
        significance: 'Dominated by intense tectonic compressional deformation and volcanic calderas.',
        elevationOrDepth: '+3.5 km'
      },
      {
        id: 'ishtar_terra',
        name: 'Ishtar Terra',
        type: 'plain',
        lat: 70.4,
        lon: 27.5,
        description: 'Northern highland plateau comparable in scale to Australia, crowned by Maxwell Montes on its eastern margin.',
        significance: 'Houses Lakshmi Planum, an elevated plateau bordered by folded mountain belts.',
        elevationOrDepth: '+4.0 km'
      },
      {
        id: 'maat_mons',
        name: 'Maat Mons',
        type: 'volcano',
        lat: 0.5,
        lon: -165.4,
        description: 'A colossal shield volcano rising 8 km above the surrounding plains; recent Magellan radar re-analysis showed active lava flows.',
        significance: 'Prime candidate for ongoing active volcanism on modern Venus.',
        elevationOrDepth: '+8.0 km'
      },
      {
        id: 'venera13',
        name: 'Venera 13 Landing Site',
        type: 'landing_site',
        lat: -7.5,
        lon: -56.0,
        description: 'Soviet lander site in Phoebe Regio that survived 127 minutes in 457°C heat to beam back the first color panoramas of Venus.',
        significance: 'Sampled alkali basalt soil and recorded low-frequency wind acoustic sounds on another world.',
        missionConnection: 'USSR Venera 13 Lander (1982)',
        elevationOrDepth: '-0.5 km'
      }
    ],
    internalLayers: [
      { name: 'Crust (Basaltic)', depth: '0 – 50 km', composition: 'Dense basaltic silicates and volcanic flows', color: '#d97706', radiusPercent: 1.0, description: 'Single stagnant lithospheric lid that undergoes periodic catastrophic global overturns.' },
      { name: 'Silicate Mantle', depth: '50 – 3,000 km', composition: 'Magnesium-iron silicates', color: '#b45309', radiusPercent: 0.88, description: 'Vigorously convecting mantle driving widespread volcanism.' },
      { name: 'Metallic Core (Iron-Nickel)', depth: '3,000 – 6,052 km', composition: 'Iron, nickel, and light alloying elements', color: '#f59e0b', radiusPercent: 0.50, description: 'Similar in scale to Earth\'s core (~3,000 km radius), lacking a strong internal dynamo due to slow rotation or core stratification.' }
    ]
  },

  io: {
    id: 'io',
    name: 'Io',
    subtitle: 'Jupiter\'s Volcanic Moon — Innermost Galilean World',
    classification: 'Galilean Moon',
    parentBody: 'Jupiter (421,700 km orbital radius)',
    equatorialRadiusKm: 1821.6,
    relativeRadiusEarth: 0.2858,
    relativeScaleDisplay: 0.54,
    surfaceGravity: 1.796,
    relativeGravityEarth: 0.183,
    rotationPeriodHours: 42.46, // 1.77 Earth days
    rotationPeriodDesc: '42.5 Hours (1.77 Days, Tidally Locked to Jupiter)',
    isRetrograde: false,
    axialTiltDeg: 0.05,
    meanTempC: -130, // volcanic vents reach >1200°C!
    surfacePressureBar: 0.000000001,
    surfacePressureDesc: 'Trace volcanic exosphere (~10⁻⁹ bar of SO₂)',
    atmosphericComposition: [
      { gas: 'Sulfur Dioxide (SO₂)', percentage: '90%' },
      { gas: 'Sulfur Monoxide (SO)', percentage: '5%' },
      { gas: 'Sodium & Chlorine', percentage: 'Plasma torus' },
      { gas: 'Atomic Oxygen & Sulfur', percentage: 'Traces' }
    ],
    colorHex: '#eab308',
    glowColorHex: '#facc15',
    hasAtmosphereGlow: true,
    atmosphereThickness: 0.015,
    summary: 'The most geologically volatile object in the Solar System. Caught in an orbital gravitational tug-of-war between giant Jupiter and outer moons Europa and Ganymede, intense tidal friction melts its mantle into an ocean of magma, powering over 400 roaring volcanoes and sulfur geysers.',
    geologyHighlights: [
      'Continuous volcanic resurfacing: Over 400 active volcanoes; zero impact craters remain visible.',
      'Tidal resonance: Trapped in a 4:2:1 Laplace orbital resonance with Europa and Ganymede.',
      'Vivid sulfur colors: Brilliant yellow, orange, and red allotropes of sulfur mixed with white SO₂ frost.',
      'Silicate lava lakes: Temperatures exceed 1,300°C—hotter than any modern lava on Earth.'
    ],
    missions: [
      'Voyager 1 (1979): Linda Morabito discovered active volcanic plumes erupting hundreds of km into space',
      'Galileo Orbiter (1995-2003): Closely mapped lava eruptions, thermal hotspots, and Io\'s iron core',
      'New Horizons (2007): Captured the famous 330-km-high umbrella plume of Tvashtar during Jupiter flyby',
      'Juno (2023-2024): Performed ultra-close 1,500-km flybys revealing detailed volcanic calderas'
    ],
    surfaceModesAvailable: [
      { mode: 'natural', label: 'Volcanic Sulfur Surface', description: 'Vivid sulfur compounds, volcanic patera calderas, and brilliant sulfur dioxide frost.' }
    ],
    features: [
      {
        id: 'loki_patera',
        name: 'Loki Patera',
        type: 'volcano',
        lat: 13.0,
        lon: -52.8,
        description: 'A colossal 202-km-wide volcanic depression containing an active, overturning lake of ultra-hot molten silicate magma.',
        significance: 'The most energetically powerful volcanic feature in the Solar System, periodically overturning its solidified crust.',
        elevationOrDepth: '202 km diameter'
      },
      {
        id: 'pele',
        name: 'Pele Volcano',
        type: 'volcano',
        lat: -18.7,
        lon: 104.7,
        description: 'Vigorous volcanic center surrounded by an immense 1,200-km-wide elliptical ring of bright red sulfur dust deposits.',
        significance: 'Its continuous gas-driven plume erupts at 1,000 m/s up to 400 kilometers high.',
        elevationOrDepth: 'Plumes to 400 km'
      },
      {
        id: 'tvashtar',
        name: 'Tvashtar Paterae',
        type: 'volcano',
        lat: 62.8,
        lon: -123.5,
        description: 'A series of volcanic calderas near Io\'s north pole that produced a 330-km fountain of glowing gas and sulfur captured by New Horizons.',
        significance: 'Showcases explosive gas eruption dynamics on a low-gravity airless body.',
        missionConnection: 'Spectacular New Horizons flyby sequence (2007)',
        elevationOrDepth: 'Curtain eruptions 25 km'
      },
      {
        id: 'boosaule_montes',
        name: 'Boösaule Montes',
        type: 'mountain',
        lat: -3.7,
        lon: -51.5,
        description: 'The highest non-volcanic mountain on Io, rearing 17.5 kilometers into space with a sheer 15-km scarp.',
        significance: 'Formed by crustal tectonic compression forced by continuous volcanic subsidence, not volcanic accumulation.',
        elevationOrDepth: '+17.5 km height'
      },
      {
        id: 'babbar_patera',
        name: 'Babbar Patera',
        type: 'plain',
        lat: -39.8,
        lon: -88.5,
        description: 'Deep volcanic depression encircled by brilliant white sulfur dioxide frost deposits and yellow sulfur flows.',
        significance: 'Exemplifies the contrast between silicate magma vents and volatile cryo-frosts.',
        elevationOrDepth: '-1.5 km'
      }
    ],
    internalLayers: [
      { name: 'Sulfur & Basalt Crust', depth: '0 – 30 km', composition: 'Silicates and condensed sulfur allotropes', color: '#ca8a04', radiusPercent: 1.0, description: 'Crust experiencing over 1 cm/year of continuous volcanic resurfacing.' },
      { name: 'Partially Molten Magma Asthenosphere', depth: '30 – 100 km', composition: 'Ultramafic silicate melt (>20% liquid magma)', color: '#ea580c', radiusPercent: 0.92, description: 'Subsurface ocean of molten rock maintained by tidal tidal dissipation.' },
      { name: 'Silicate Mantle', depth: '100 – 900 km', composition: 'Hot olivine and pyroxene rock', color: '#b45309', radiusPercent: 0.75, description: 'Convecting solid mantle carrying heat outward.' },
      { name: 'Metallic Core (Iron or Iron-Sulfide)', depth: '900 – 1,822 km', composition: 'Iron and iron sulfide (FeS)', color: '#fbbf24', radiusPercent: 0.50, description: 'Dense core accounting for ~20% of Io\'s planetary mass.' }
    ]
  },

  titan: {
    id: 'titan',
    name: 'Titan',
    subtitle: 'Saturn\'s Hydrocarbon Moon — Second Largest Moon in the Solar System',
    classification: 'Giant Ice Moon',
    parentBody: 'Saturn (1,221,870 km orbital radius)',
    equatorialRadiusKm: 2574.7,
    relativeRadiusEarth: 0.4037,
    relativeScaleDisplay: 0.65,
    surfaceGravity: 1.352,
    relativeGravityEarth: 0.138,
    rotationPeriodHours: 382.7, // 15.95 days
    rotationPeriodDesc: '15.95 Earth Days (Tidally Locked to Saturn)',
    isRetrograde: false,
    axialTiltDeg: 0.33,
    meanTempC: -179, // cryogenic 94 Kelvin
    surfacePressureBar: 1.45,
    surfacePressureDesc: '1.45 bar (45% higher than Earth sea level!)',
    atmosphericComposition: [
      { gas: 'Molecular Nitrogen (N₂)', percentage: '95.0%' },
      { gas: 'Methane (CH₄)', percentage: '4.9%' },
      { gas: 'Hydrogen (H₂)', percentage: '0.1%' },
      { gas: 'Organic Tholins & Ethane', percentage: 'Haze deck' }
    ],
    colorHex: '#f59e0b',
    glowColorHex: '#fbbf24',
    hasAtmosphereGlow: true,
    atmosphereThickness: 0.07,
    summary: 'The only moon in the Solar System possessing a substantial, dense atmosphere, and the only planetary body other than Earth with stable rivers, lakes, and seas on its surface—crafted not of liquid water, but of cryogenic liquid methane and ethane.',
    geologyHighlights: [
      'Dense Nitrogen Atmosphere: Extends 600 km into space; surface pressure is 1.45 times that of Earth.',
      'Active Methane Weather Cycle: Methane clouds, methane rains, carved river channels, and polar lakes.',
      'Organic Tholin Sand Dunes: Equatorial plains covered in hundred-meter-tall dunes of soot-like carbon particles.',
      'Subsurface Global Ocean: Cassini gravity and tidal flexing measurements indicate a liquid water-ammonia sea beneath the ice.'
    ],
    missions: [
      'Voyager 1 (1980): Revealed the impenetrable golden photochemical smog canopy',
      'Cassini Orbiter (2004-2017): 127 targeted flybys mapped surface with radar, infrared, and gravity sensors',
      'Huygens Probe (ESA, Jan 14, 2005): Parachuted to the surface; returned photos of rounded ice pebbles and river channels',
      'NASA Dragonfly (launching 2028): Nuclear-powered octocopter destined to fly across Titan\'s dune fields in 2034'
    ],
    surfaceModesAvailable: [
      { mode: 'natural', label: 'Dense Smog Atmosphere', description: 'Photochemical golden-orange tholin hydrocarbon haze completely cloaking the surface.' },
      { mode: 'infrared_surface', label: 'Cassini Radar & Infrared Surface', description: 'Underlying surface revealing northern methane seas (Kraken Mare), bright icy highlands (Xanadu), and dark dune fields.' }
    ],
    features: [
      {
        id: 'kraken_mare',
        name: 'Kraken Mare',
        type: 'sea',
        lat: 68.0,
        lon: -50.0,
        description: 'The largest body of liquid on Titan, covering 500,000 square kilometers of liquid methane and ethane (larger than the Caspian Sea).',
        significance: 'Reaches depths over 300 meters; radar soundings detected smooth liquid mirror reflections.',
        elevationOrDepth: '>300 m liquid depth'
      },
      {
        id: 'ligeia_mare',
        name: 'Ligeia Mare',
        type: 'sea',
        lat: 79.0,
        lon: -112.0,
        description: 'Northern polar sea spanning 126,000 square kilometers, filled with almost pure liquid methane and fed by dendritic river canyons.',
        significance: 'Mapped extensively by Cassini radar altimetry showing remarkable seabed transparency.',
        elevationOrDepth: '170 m depth'
      },
      {
        id: 'huygens_site',
        name: 'Huygens Landing Site',
        type: 'landing_site',
        lat: -10.3,
        lon: 167.7,
        description: 'Site where ESA\'s Huygens lander touched down into damp hydrocarbon mud on January 14, 2005.',
        significance: 'The furthest landing of a human-made spacecraft from Earth; imaged methane-carved river channels.',
        missionConnection: 'ESA Huygens Probe (Cassini Mission)',
        elevationOrDepth: '-0.3 km'
      },
      {
        id: 'xanadu',
        name: 'Xanadu Regio',
        type: 'plain',
        lat: -15.0,
        lon: 100.0,
        description: 'An Australia-sized, highly reflective plateau of porous water ice mountains carved by cryogenic rain and river valleys.',
        significance: 'The first surface feature identified on Titan via Hubble Space Telescope before Cassini\'s arrival.',
        elevationOrDepth: '+1.5 km hills'
      },
      {
        id: 'shangri_la',
        name: 'Shangri-La Dune Sea',
        type: 'plain',
        lat: -10.0,
        lon: -15.0,
        description: 'Vast low-latitude dark plain comprised of towering, longitudinal hydrocarbon sand dunes molded by atmospheric tidal winds.',
        significance: 'Target destination for NASA\'s future Dragonfly rotorcraft mission.',
        missionConnection: 'Dragonfly Mission Target (2034)',
        elevationOrDepth: 'Dunes 100–150 m high'
      }
    ],
    internalLayers: [
      { name: 'Organic Sediment & Ice I Crust', depth: '0 – 80 km', composition: 'Water ice (rock-hard at -180°C) and organic tholin sediments', color: '#b45309', radiusPercent: 1.0, description: 'Rigid outer shell of water ice acting like granite on Earth.' },
      { name: 'Global Subsurface Liquid Ocean', depth: '80 – 300 km', composition: 'Liquid water with dissolved ammonia antifreeze', color: '#0284c7', radiusPercent: 0.88, description: 'Vast internal salty ocean kept liquid by geothermal heat and ammonia.' },
      { name: 'High-Pressure Ice Shell (Ice VI / VII)', depth: '300 – 700 km', composition: 'Dense crystalline water ice polymorphs', color: '#38bdf8', radiusPercent: 0.70, description: 'Exotic high-density ice phases compressed by the ocean above.' },
      { name: 'Hydrous Silicate Core', depth: '700 – 2,575 km', composition: 'Hydrated silicates and nickel-iron rock', color: '#78716c', radiusPercent: 0.48, description: 'Dense rocky core comprising ~60% of Titan\'s total mass.' }
    ]
  }
};

export const CELESTIAL_ORDER: { id: string; name: string }[] = [
  { id: 'moon', name: 'The Moon' },
  { id: 'mars', name: 'Mars' },
  { id: 'venus', name: 'Venus' },
  { id: 'io', name: 'Io' },
  { id: 'titan', name: 'Titan' }
];
