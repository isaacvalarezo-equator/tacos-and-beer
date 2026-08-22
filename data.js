/* Tacos and Beer — datos del prototipo.
   Precios y horarios provienen de la investigación en ../research/01-restaurant-profile.md
   Fuentes: AllMenus, TripAdvisor, Restaurantji, BeerMenus.
   PENDIENTE de confirmar con el restaurante antes de publicar. */

/* Direcciones, teléfonos y años salen de ../research/ y del vault. Lo que no
   tiene fuente no vive aquí: la capacidad de cada local está sin confirmar, así
   que no hay campo `seats` — hay que preguntársela al restaurante. */
const LOCATIONS = {
  nola: {
    id: 'nola',
    name: 'New Orleans',
    hood: 'Lower Garden District',
    address: '1622 St. Charles Ave',
    city: 'New Orleans, LA 70130',
    phone: '(504) 304-8722',
    tel: '+15043048722',
    maps: 'https://maps.google.com/?q=1622+St+Charles+Ave+New+Orleans+LA+70130',
    since: 2014,
    // 0 = domingo
    hours: [[11,20.75],[11,22.75],[11,22.75],[11,22.75],[11,22.75],[11,22.75],[11,22.75]],
    hoursText: [['Mon–Sat','11:00 AM – 10:45 PM'],['Sun','11:00 AM – 8:45 PM']],
    pitch: 'On the Avenue, right on the streetcar line and the parade route.',
    audience: 'visitors and locals',
    accent: 'rojo'
  },
  slidell: {
    id: 'slidell',
    name: 'Slidell',
    hood: 'Old Towne',
    address: '2142 1st St',
    city: 'Slidell, LA 70458',
    phone: '(985) 641-4969',
    tel: '+19856414969',
    maps: 'https://maps.google.com/?q=2142+1st+St+Slidell+LA+70458',
    // La investigación no tiene el año de Slidell: la cronología confirmada es
    // Hammond (2012) → Slidell (?) → New Orleans (2014). Sin dato, sin año.
    since: null,
    hours: [[11,21],[11,24],[11,24],[11,24],[11,26],[11,26],[11,26]],
    hoursText: [['Mon–Wed','11:00 AM – 12:00 AM'],['Thu–Sat','11:00 AM – 2:00 AM'],['Sun','11:00 AM – 9:00 PM']],
    pitch: 'The Old Towne patio. Long tables, big families, and $1 Taco Tuesday.',
    audience: 'Northshore families',
    accent: 'turquesa'
  },
  hammond: {
    id: 'hammond',
    name: 'Hammond',
    hood: 'Downtown · SLU',
    address: '201 E Thomas St',
    city: 'Hammond, LA 70401',
    phone: '(985) 542-7430',
    tel: '+19855427430',
    maps: 'https://maps.google.com/?q=201+E+Thomas+St+Hammond+LA+70401',
    since: 2012,
    hours: [[12,21],[11,22],[11,22],[11,22],[11,25],[11,25],[11,25]],
    hoursText: [['Mon–Wed','11:00 AM – 10:00 PM'],['Thu–Sat','11:00 AM – 1:00 AM'],['Sun','12:00 PM – 9:00 PM']],
    pitch: 'One block off campus. Open till 1 AM Thursday through Saturday.',
    audience: 'SLU students',
    accent: 'amarillo'
  }
};

/* Menú por ubicación. Los precios difieren entre locales — dato confirmado
   en la investigación y uno de los argumentos de venta del menú central. */
const MENU = {
  nola: [
    { cat: 'To start', items: [
      ['Tacos & Beer Sampler', 'A little of everything we do well', 14.95, 'top'],
      ['D.U.I. Fries', 'Fries, meat, cheese, and everything else', 8.95, 'top'],
      ['Choriqueso', 'Chorizo melted into cheese, with tortillas', 7.95],
      ['Nachos', 'Add meat for $2.50', 7.95],
      ['Guacamole', 'Made in house', 3.75],
      ['La Botana', 'A platter built for sharing', 14.95],
      ['Ceviche Tostada', '', 6.95],
      ['Shrimp Cocktail', '', 10.95],
      ['Chipotle Hot Wings', '', 5.95],
      ['Chips & Salsa', '', 2.50]
    ]},
    { cat: 'Favorites', items: [
      ['Big A$$ Burrito', 'The name is not an exaggeration', 12.99, 'top'],
      ['Chimi Chingon', 'A chimichanga done right', 9.95],
      ['Baja Fish Tacos', 'Beer-battered fish, cabbage, and crema', 9.95, 'top'],
      ['El Huarache', '', 9.95],
      ['Tacos Dorados', '', 4.95],
      ['Quesadilla Dinner', '', 9.95],
      ['Taco 12 Pack', 'Up to 3 meats. For the whole table', 19.99, 'grupo']
    ]},
    { cat: 'Plates', items: [
      ['Carne Asada', 'With rice, beans, and tortillas', 14.99, 'top'],
      ["Micky's Mole", 'Our house mole', 9.95],
      ['Rocky Relleno', 'Battered stuffed pepper', 9.95],
      ['Three Enchiladas', '', 9.95],
      ['Quesadillas Gringas', '', 9.95],
      ['Three Flautas', '', 9.95],
      ['Los Sopes', '', 9.95]
    ]},
    { cat: 'Tacos à la carte', items: [
      ['Taco', 'Pick your meat', 1.95],
      ['Fish Taco', '', 2.69],
      ['Flauta', '', 2.50],
      ['Enchilada', '', 2.50],
      ['Sope', '', 4.25],
      ['Huarache', '', 7.95],
      ['Chile Relleno', '', 5.95]
    ]},
    { cat: 'Breakfast, all day', items: [
      ['Breakfast Burrito', '', 7.95],
      ['Chilaquiles Con Huevos', '', 6.95],
      ['Huevos a la Mexicana', '', 6.95],
      ['Huevos Con Chorizo', '', 6.95],
      ['Los Rancheros', '', 6.95]
    ]},
    { cat: 'Tortas and burgers', items: [
      ['Torta', 'The Mexican po-boy', 8.95],
      ['Half Pound Burger', '', 7.95]
    ]},
    { cat: 'Dessert', items: [
      ['Flan', '', 3.99],
      ['Tres Leches', '', 3.99],
      ['Arroz Con Leche', '', 3.99]
    ]}
  ],
  slidell: [
    { cat: 'To start', items: [
      ['T&B Sampler', 'A little of everything we do well', 14.99, 'top'],
      ['D.U.I. Fries', 'Fries, meat, cheese, and everything else', 9.99, 'top'],
      ['Choriqueso', 'Chorizo melted into cheese', 8.99],
      ['Nachos', 'Add meat for $2.50', 8.99],
      ['Botana', 'A platter built for sharing', 14.99, 'grupo'],
      ['Guacamole', 'Made in house', 4.95],
      ['Shrimp Cocktail', '', 12.99],
      ['Ceviche', '', 8.99],
      ['Chipotle Wings', 'Chipotle BBQ or mango habanero', 5.99]
    ]},
    { cat: 'Tacos', items: [
      ['Taco 12 Pack', 'Up to 3 meats. For the whole table', 21.99, 'grupo'],
      ['Grilled Shrimp Tacos', '', 11.99, 'top'],
      ['Baja Fish Tacos', 'Beer-battered fish, cabbage, and crema', 10.99, 'top'],
      ['Tacos Dorados', '', 6.99],
      ['Taco', 'Pick your meat', 2.25]
    ]},
    { cat: 'Favorites', items: [
      ['Big Ass Burrito', 'The name is not an exaggeration', 10.99, 'top'],
      ['Chimi Chingon', 'A chimichanga done right', 10.99, 'top'],
      ["Micky's Mole Enchiladas", 'Our house mole', 11.99],
      ['Carne Asada', 'With rice, beans, and tortillas', 13.99],
      ['Rocky Relleno Dinner', '', 11.99],
      ['Quesadilla Dinner', '', 11.99],
      ['Flautas Dinner', '', 11.99],
      ['Enchilada Dinner', '', 11.99],
      ['Tamale Dinner', '', 10.99],
      ['Sopes', '', 11.99]
    ]},
    { cat: 'Soups and salads', items: [
      ['Large Seafood Soup', '', 14.99],
      ['Jumbo Shrimp Soup', '', 14.99],
      ['Taco Salad', '', 9.99],
      ['Tortilla Soup', '', 5.99]
    ]},
    { cat: 'Burgers and tortas', items: [
      ['American Burger', 'Half a pound of Certified Angus Beef', 8.99],
      ['Torta', 'The Mexican po-boy', 8.99],
      ['Chicken Tenders', '', 6.99]
    ]},
    { cat: 'Breakfast', items: [
      ['Breakfast Burrito', '', 8.99],
      ['Chilaquiles con Huevos', '', 8.99],
      ['Huevos a la Mexicana', '', 8.99],
      ['Huevos con Chorizo', '', 8.99],
      ['Huevos Rancheros', '', 8.99]
    ]},
    { cat: 'Dessert', items: [
      ['Churros', '', 3.99],
      ['Flan', '', 3.99],
      ['Tres Leches', '', 3.99]
    ]}
  ],
  hammond: [
    { cat: 'Favorites', items: [
      ['Big Ass Burrito', 'The name is not an exaggeration', 13.99, 'top'],
      ["Santino's Burrito Bowl", 'Hammond only', 9.99, 'top'],
      ['Chimi Chinchon', 'A chimichanga done right', 11.99],
      ["Micky's Mole Enchiladas", 'Our house mole', 11.99, 'top'],
      ['Carne Asada', 'With rice, beans, and tortillas', 13.99],
      ['Pollo Asado', '', 12.99],
      ['El Rocky Relleno', '', 11.99],
      ['Quesadilla Combo', '', 11.99],
      ['Las Flautas', '', 11.99],
      ['Los Sopes', '', 9.99]
    ]},
    { cat: 'Breakfast', items: [
      ['Breakfast Burrito', '', 8.99, 'top'],
      ['Chilaquiles con Huevos', '', 8.99],
      ['Huevos a la Mexicana', '', 7.99],
      ['Huevos con Chorizo', '', 7.99],
      ['Los Rancheros', '', 7.99]
    ]},
    { cat: 'À la carte', items: [
      ['Sope', '', 4.99],
      ['French Fries', '', 3.50],
      ['Enchilada', '', 2.99],
      ['Flauta', '', 2.99],
      ['Fish Taco', '', 2.99]
    ]},
    { cat: 'For the kids', items: [
      ['Mini Tacos', '', 4.99],
      ['Quesadilla', '', 4.99],
      ['Chicken Fingers', '', 4.99],
      ['Enchiladas', '', 4.99]
    ]},
    { cat: 'Dessert', items: [
      ['Tres Leches', '', 4.99],
      ['Flan', '', 4.99]
    ]}
  ]
};

/* Barra — confirmado para New Orleans vía BeerMenus. */
const BAR = {
  draft: [
    ['Abita Amber', 'Amber Ale · 4.5%', 6, 9, 24],
    ['Abita Jockamo IPA', 'IPA · 6.5%', 8, 11, 32],
    ['Modelo Especial', 'Pilsner · 4.4%', 6, 9, 24],
    ['Modelo Negra', 'Vienna Lager · 5.4%', 6, 9, 24],
    ['Pacífico Clara', 'Pilsner · 4.5%', 6, 9, 24],
    ['Dos Equis Especial', 'Pale Lager · 4.45%', 6, 9, 22],
    ['Golden Road Mango Cart', 'Wheat Ale · 4.0%', 6, 9, 24],
    ['Gnarly Barley Jucifer IPA', 'IPA · 6.0%', 8, 11, 32],
    ['Miller Lite', 'Pale Lager · 4.2%', 5, 8, 20],
    ['Angry Orchard Crisp Apple', 'Cider · 5.0%', 7, 10, 28]
  ],
  margs: [
    ['Top Shelf Margarita', 'Frozen or on the rocks', 12, 16, 30],
    ['Cadillac Margarita', 'On the rocks only', 16, 21, 36]
  ],
  specials: [
    ['Beer & Shot', 'A pint of Modelo and a shot of El Jimador Blanco', 10],
    ['Spiked Limeade', 'Classic, cherry, peach, raspberry, or blueberry', 8],
    ['Mystery Shot', 'Do not ask', 2],
    ['Homemade Limeade', '20 oz, no alcohol', 4]
  ]
};

/* Calendario de Louisiana. Convierte la dirección en producto. */
const EVENTS = [
  { date: '2027-02-09', title: 'Mardi Gras', where: ['nola'],
    copy: 'The balcony looks straight onto the St. Charles parade route. We have sold it before and it goes early.',
    cta: 'Hold a spot on the balcony' },
  { date: '2026-10-03', title: 'Live music night', where: ['nola','slidell'],
    copy: 'You play? Write us. Coming to listen? Get here early, the front tables go fast.',
    cta: 'Message the restaurant' },
  { date: '2026-11-13', title: 'SLU Family Day', where: ['hammond'],
    copy: 'Parents are in town. A long table for 12 and a taco bar with nobody cooking.',
    cta: 'Hold the long table' },
  { date: '2026-09-13', title: 'Saints game day', where: ['nola','slidell','hammond'],
    copy: 'Screens on, 64 oz pitchers, and taco packs for the whole crew.',
    cta: 'Build the package' },
  { date: '2026-08-25', title: 'Taco Tuesday', where: ['slidell'],
    copy: '$1 tacos all day, every Tuesday. Yes, all day.',
    cta: 'See the menu' },
  { date: '2027-04-15', title: 'French Quarter Fest', where: ['nola'],
    copy: 'Four days of festival ten minutes away. We open early.',
    cta: 'Get on the list' },
  { date: '2027-04-09', title: 'Strawberry Festival', where: ['hammond'],
    copy: 'Ponchatoula fills up. So do we. Plan ahead.',
    cta: 'Get on the list' }
];

const OCCASIONS = [
  ['birthday', 'Birthday'],
  ['graduation', 'Graduation'],
  ['gameday', 'Game day'],
  ['boil', 'Instead of a crawfish boil'],
  ['work', 'Work party'],
  ['rehearsal', 'Rehearsal dinner'],
  ['other', 'Something else']
];

/* Paquetes de grupo. Se venden contra el catering de crawfish local,
   que va de $17 a $26 por cabeza (gulfcoastcrawfish.com/packages). */
const PACKAGES = [
  { id: 'taqueria', name: 'Taco Bar', per: 18,
    desc: 'Three meats, fresh tortillas, rice, beans, and all the salsa.',
    includes: ['3 meats of your choice', 'Corn and flour tortillas', 'Rice and beans', 'Salsa and toppings bar', 'Chips and salsa for the table'] },
  { id: 'fiesta', name: 'La Fiesta', per: 26,
    desc: 'The full taco bar, plus botana to start and dessert to finish.',
    includes: ['Everything in the Taco Bar', 'Botana to start', 'Choriqueso and guacamole', 'Flan or tres leches', 'A server just for your group'] },
  { id: 'barra', name: 'Fiesta + Open Bar', per: 38,
    desc: 'Two hours of open bar: draft beer and house margaritas.',
    includes: ['Everything in La Fiesta', '2 hours of open bar', 'Draft beer and margaritas', '64 oz pitchers on the table', 'Your own reserved area'] }
];

/* Fotos del local, mapeadas por platillo. Solo las que existen de verdad:
   si un platillo no está aquí, la tarjeta cae al bloque de color. */
const FOTOS = {
  'Tacos & Beer Sampler': 'img/platon.jpg',
  'T&B Sampler':          'img/platon.jpg',
  'Carne Asada':          'img/asada.jpg',
  'Baja Fish Tacos':      'img/pescado.jpg',
  'Taco 12 Pack':         'img/tacos.jpg',
  'Tacos Dorados':        'img/tacos.jpg',
  'Torta':                'img/torta.jpg',
  'Grilled Shrimp Tacos': 'img/pescado.jpg',
  'Big A$$ Burrito':      'img/papel.jpg',
  'Big Ass Burrito':      'img/papel.jpg',
  'Chimi Chingon':        'img/papel.jpg',
  "Micky's Mole Enchiladas": 'img/asada.jpg',
  'Los Sopes':            'img/tacos.jpg'
};

/* Taco Tuesday. Confirmado en Slidell con foto del propio local ($1 todo el
   día). En Hammond aparece mencionado en reseñas. En New Orleans NO está
   confirmado: queda marcado como pendiente y el sitio no promete precio ahí. */
const TUESDAY = {
  slidell: { price: 1.00, all_day: true,  confirmed: true,
             line: '$1 tacos. All day. Every Tuesday.' },
  hammond: { price: 1.00, all_day: true,  confirmed: false,
             line: '$1 tacos all day. Confirm with the restaurant.' },
  nola:    { price: null, all_day: false, confirmed: false,
             line: 'Ask us about Tuesday specials on the Avenue.' }
};
