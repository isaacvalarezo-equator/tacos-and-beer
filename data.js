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
/* ─────────────────────────────────────────────────────────────────────
   CARTA REAL DE NEW ORLEANS
   Transcrita de fotografías de la carta física del local, tomadas por Isaac
   el 2026-08-22. Están en `../assets/carta-real/`.

   La maquetación de la carta pone el precio en la línea de ARRIBA del plato,
   no a su lado. Verificado ampliando la columna de aperitivos.

   ⚠️ DOS PRECIOS QUEDARON TAPADOS por el reflejo del plástico y hay que
   confirmarlos con el restaurante: T&B Sampler y Nachos. Van marcados con
   `null` y el sitio los muestra como "ask us" en vez de inventar una cifra.

   Carnes a elegir: grilled chicken, asada, chorizo, carnitas, al pastor,
   birria, suadero, tinga, carne molida. Lengua +$1, camarón +$2.50,
   champiñón +$1.50.
   18% de propina se añade a mesas de 6 o más. ───────────────────────────── */
const MENU = {
  nola: [
    { cat: 'Tacos', items: [
      ['Street Taco', 'Your choice of meat, onion and cilantro on a corn tortilla, with lime and spicy salsa. Lettuce wrap or keto cheese crisp add 75¢', 2.50, 'top'],
      ['Taco Gabacho', 'Crunchy taco with lettuce, sour cream, shredded cheese and pico de gallo', 4],
      ['Gnarly Taco', 'Sirloin marinated in Gnarly Barley Jucifer and our citrus blend, with house guacamole, onion and cilantro', 6, 'top'],
      ['Tacos Dorados', 'Three hard shell tacos with lettuce, sour cream and crumbled queso. Ground beef, refried beans or potatoes', 10],
      ['Quesabirria', 'Three cheesy tacos with our marinated beef, with a broth to drench them in', 12, 'top'],
      ['Big Sur Fish Tacos', 'Three grilled or fried fish tacos with pico de gallo, sliced cabbage and our Baja sauce', 14],
      ['Quesashrimp Tacos', 'Three birria-style chopped shrimp with onion, cilantro and tomato, melted cheese and creamy jalapeño dip', 14],
      ['Baja Shrimp Tacos', 'Three grilled shrimp tacos on corn tortillas with chipotle sauce, shredded cabbage and pico de gallo', 16],
      ['Taco 12 Pack', 'Twelve soft tacos with salsa, diced onion and cilantro. Up to three meats. Shrimp or fish pack $35', 30, 'grupo']
    ]},
    { cat: 'Favorites', items: [
      ['Molcajete', 'Skirt steak, chicken, sausage and shrimp with grilled onions, served sizzling. Two orders of rice, beans, guacamole, sour cream, pico de gallo and warm tortillas', 40, 'grupo'],
      ['Big Ass Burrito', 'Rice, beans, guacamole, sour cream, pico de gallo, shredded cheese and your meat. Make it wet for $2', 16, 'top'],
      ['Chimi Chingon', 'Deep fried burrito with your meat, onions, shredded cheese, cilantro, rice and beans, smothered in cheese dip', 16],
      ['Las Flautas', 'Three rolled corn tortillas with chicken or beef, fried and topped with sour cream, guacamole and crumbled cheese', 14],
      ['Enchiladas Tradicional', 'Three enchiladas with your meat, lettuce, crumbled cheese and sour cream. Salsa verde or roja', 16],
      ['Pollo Asado', 'Citrus marinated chicken with sautéed onions, rice and warm corn tortillas', 16],
      ['Carne Asada', 'Marinated skirt steak with sautéed onions, rice, beans and pico de gallo', 20],
      ['Quesadilla Combo', 'Large quesadilla with your meat, rice, beans, sour cream and guacamole', 14],
      ['Chile Relleno', 'Poblano stuffed with melted cheese and your meat, covered in our homemade salsa', 16],
      ['Los Sopes', 'Two crispy cornmeal shells with beans, sour cream, crumbled cheese, lettuce and your meat', 14]
    ]},
    { cat: 'Appetizers', items: [
      ['Unlimited Chips & Salsa', '', 6],
      ['Cheese Dip', 'Melted cheese with jalapeños, with chips and salsa. Small or large', 6],
      ['Guacamole', 'Made fresh with onion, cilantro and tomato', 6],
      ['Birria Eggrolls', 'Crispy eggrolls stuffed with shredded beef, with dipping broth', 10, 'top'],
      ['T&B Sampler', 'Nachos with your meat, quesadilla triangles and mini flautas, with sour cream and guacamole', null],
      ['Nachos', 'Homemade chips with beans, melted cheese, sour cream, pico de gallo and jalapeños. Add meat $3', null],
      ['D.U.I. Fries', 'Cheese fries with sour cream, jalapeños and pico de gallo, over beans. Add meat $3', 14, 'top'],
      ['Choriqueso', 'Our homemade chorizo mixed into our cheese dip, with chips', 12],
      ['Shrimp Cocktail', 'Jumbo shrimp in our spicy cocktail sauce with avocado, cilantro, onion and tomato', 16],
      ['Ceviche', 'Lime marinated fish with pico de gallo and avocado slices, with fresh chips. Shrimp ceviche $2 more', 12],
      ['Chipotle Wings', 'Jumbo wings in our chipotle BBQ sauce. Six or twelve piece', 10],
      ['La Botana', 'Platter of eight taquitos, carnitas, crumbled Mexican cheese, guacamole and jalapeños', 20, 'grupo']
    ]},
    { cat: 'Fresh-Mex', items: [
      ['Southwest Salad', 'Spring mix with avocado, black beans, corn, tomato, cotija, tortilla strips and cilantro ranch. Chicken or steak', 14],
      ['Burrito Bowl', 'Your meat over rice, black beans, lettuce, guacamole, corn and cheese', 12],
      ['Taco Salad', 'Homemade taco shell with lettuce, guacamole, sour cream, beans, cheese, pico de gallo and your meat', 12],
      ['Veggie Burrito', 'Portobello, sautéed onion, green bell pepper, rice, beans, sour cream, avocado and cheese', 12],
      ['Bajá Shrimp Burrito', 'Grilled shrimp, rice, pico de gallo, avocado and spicy baja sauce. Melted queso $2', 16],
      ['Gnarly Burrito', 'Jucifer marinated sirloin, rice, beans, onion, cilantro and queso fresco. Shrimp $2.50', 16],
      ['Seafood Soup', 'Giant bowl with shrimp, fish, mussels, crab legs, broccoli and carrots in a steamy broth', 20, 'grupo']
    ]},
    { cat: 'Burgers & tortas', items: [
      ['American Burger', 'Half pound patty with mayo, mustard, ketchup, lettuce, tomato, onion, pickles and American cheese, with fries', 15],
      ['Mexican Burger', 'Patty topped with our homemade chorizo and avocado, chipotle mayo, lettuce, tomato, onion and pickles, with fries', 16],
      ['Chicken Sandwich', 'Grilled chicken, chipotle crema, lettuce, tomato, onion, pickles and avocado, with fries', 14],
      ['L.A. Street Dog', 'Bacon wrapped dog with mayo, mustard, ketchup, grilled onions, jalapeños and guacamole, with fries', 13],
      ['Torta', 'The Mexican po-boy. Hot and dressed with beans, lettuce, tomato, queso fresco, avocado and your meat', 15]
    ]},
    { cat: 'A la carte', items: [
      ['Bean Soup', 'Our famous bean soup by the bowl', 3],
      ['Tamale', 'Red pork tamale', 4],
      ['Enchilada', 'Topped with lettuce and sour cream. Cheese dip $1', 4],
      ['Flauta', 'Topped with lettuce, guacamole and sour cream. Order of five $12', 3],
      ['Big Sur Fish Taco', 'Grilled fish with our chipotle sauce, shredded cabbage and pico de gallo', 5],
      ['Street Corn', 'Corn on the cob with mayo, crumbled cheese, lime and tajín', 6],
      ['Shrimp Taco', 'Gulf shrimp with pico de gallo, sliced cabbage and chipotle sauce', 6],
      ['French Fries', '', 6],
      ['Sope', 'Crispy cornmeal shell with beans, sour cream, crumbled cheese, lettuce and your meat', 8],
      ['Quesadilla', 'Flour tortilla with melted cheese and your meat', 9],
      ['Chile Relleno', 'Lightly fried poblano stuffed with your meat and cheese, topped with red salsa', 12],
      ['Burrito', 'Rice, beans, cilantro, onion and your meat. Make it wet for $1', 12],
      ['Chicken Strips with Fries', '', 12]
    ]},
    { cat: 'Breakfast', items: [
      ['Breakfast Burrito', 'Scrambled eggs, chorizo, cheese, refried beans and rice. Make it wet for $2', 12],
      ['Huevos a la Mexicana', 'Scrambled eggs with tomato, onion and jalapeño, with rice and beans', 12],
      ['Huevos con Chorizo', 'Scrambled eggs with our homemade spicy sausage, with rice and beans', 12],
      ['Los Huevos Rancheros', 'Two eggs sunny side up with salsa over a crispy tortilla, with rice and beans', 12],
      ['Chilaquiles con Huevo', 'Crispy tortilla chips smothered in spicy red sauce with eggs, rice and beans', 12]
    ]},
    { cat: 'Kids', items: [
      ['Quesadilla', 'Shredded chicken and melted cheese, with rice and beans', 8],
      ['Enchilada', 'Cheese enchilada with rice and beans', 8],
      ['Chicken Fingers', 'Two breaded strips with BBQ sauce and fries', 8],
      ['Mini Tacos', 'Mini crunchy chicken tacos with rice and beans', 8]
    ]},
    { cat: 'Dessert', items: [
      ['Churro Fries', 'Mini cinnamon sugar churros', 8],
      ['Flan', 'Caramel custard, made here', 8],
      ['Tres Leches', 'Ultra moist sweet sponge cake', 8]
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
