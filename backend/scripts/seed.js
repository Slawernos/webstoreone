/**
 * Seed script: adatbázis feltöltése 8 kategóriával és 55 termékkel
 *
 * Futtatás: npm run seed
 */

if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const fs = require('fs');
const path = require('path');

const { sequelize, Category, Product } = require('../src/models');

const categories = [
  { name: 'Kutyaeledel',           slug: 'kutyaeledel',           description: 'Száraz és nedves tápok, snackek kutyáknak' },
  { name: 'Kutyakiegészítők',      slug: 'kutyakiegeszitok',      description: 'Játékok, nyakörv, póráz, fekhelyek' },
  { name: 'Macskaeledel',          slug: 'macskaeledel',          description: 'Száraz és nedves tápok, snackek macskáknak' },
  { name: 'Macskakiegészítők',     slug: 'macskakiegeszitok',     description: 'Kaparó, alomdoboz, játékok, fekhelyek' },
  { name: 'Hüllőeledel',           slug: 'hulloeledel',           description: 'Élő és szárított táplálék hüllőknek' },
  { name: 'Hüllőkiegészítők',      slug: 'hullokiegeszitok',      description: 'Terrárium, UV lámpa, fűtőszőnyeg' },
  { name: 'Rágcsálóeledel',        slug: 'ragcsaloeledel',        description: 'Magkeverék, zöldség, rágcsáló snack' },
  { name: 'Rágcsálókiegészítők',   slug: 'ragcsalokiegeszitok',   description: 'Ketrec, futókerék, ital- és etetőautomata' },
];

const productsByCategory = {
  kutyaeledel: [
    {
      name: 'Royal Canin Medium Adult 15 kg', price: 18990, stock: 42,
      description: '**Tömeg:** 15 kg | **Ajánlott:** közepes méretű kutyák (11–25 kg), 1–7 év\n\nTeljes értékű száraztáp ízletes baromfival és rizzsel.\n\n- Omega-3 és omega-6 zsírsavak az egészséges szőrzetért\n- Speciális szemcsealak a fogkő megelőzésére\n- Prebiotikumok az egészséges emésztésért',
    },
    {
      name: "Hill's Science Plan Adult Large 14 kg", price: 22490, stock: 28,
      description: '**Tömeg:** 14 kg | **Ajánlott:** nagy testű kutyák (25 kg felett), 1–5 év\n\nKlinikai vizsgálatokkal alátámasztott, csirkével ízesített prémium táp.\n\n- Glükozamin és kondroitin az ízületek védelméért\n- Természetes antioxidánsok az immunrendszerért\n- Könnyen emészthető fehérjék',
    },
    {
      name: 'Purina Pro Plan Sensitive 12 kg', price: 16990, stock: 35,
      description: '**Tömeg:** 12 kg | **Ajánlott:** érzékeny emésztésű kutyák\n\nLazaccal és rizzsel készült, könnyű emészthetőségű formula.\n\n- Gluténmentes recept\n- Omega zsírsavak az egészséges bőrért\n- Prebiotikumok az emésztőrendszer egyensúlyáért',
    },
    {
      name: 'Brit Premium Adult M 15 kg', price: 9990, stock: 60,
      description: '**Tömeg:** 15 kg | **Ajánlott:** közepes méretű felnőtt kutyák\n\nGazdaságos, kiváló minőségű táp csirkével és cikóriával.\n\n- Magas hústartalommal\n- Probiotikumok az emésztésért\n- Nem tartalmaz GMO alapanyagokat',
    },
    {
      name: 'Acana Wild Prairie 11.4 kg', price: 27990, stock: 15,
      description: '**Tömeg:** 11.4 kg | **Ajánlott:** minden méretű felnőtt kutya\n\nGabonamentesen, 70%-os hústartalommal – csirke, pulyka, tojás.\n\n- Biológiailag megfelelő, gabonamentes recept\n- Friss és dehidratált hús kombinációja\n- Zöldségek és gyümölcsök természetes tápanyagokért',
    },
    {
      name: 'Pedigree Vital Protection 10 kg', price: 6490, stock: 80,
      description: '**Tömeg:** 10 kg | **Ajánlott:** felnőtt kutyák\n\nBarhányhússal és zöldségekkel gazdagított mindennapi táp.\n\n- Cink és biotin az egészséges szőrzetért\n- Kalcium és foszfor az erős fogakért\n- Kedvező ár-érték arány',
    },
    {
      name: 'Animonda GranCarno Senior 800g', price: 1290, stock: 50,
      description: '**Tömeg:** 800 g | **Ajánlott:** idős kutyák (7 év felett)\n\nPrémium nedves húsos táp idős kutyák számára, marhával.\n\n- Csökkentett foszfortartalom a veseegészségért\n- Könnyű rághatóság\n- Kényelmes egyadagos kiszerelés',
    },
    {
      name: 'Cesar Deluxe válogatás 12x100g', price: 2990, stock: 45,
      description: '**Tömeg:** 12 × 100 g | **Ajánlott:** kis és közepes testű kutyák\n\nVálogatott húsos falatkák szószban, tálcás kiszerelésben.\n\n- 6 különböző ízesítés egy csomagban\n- Puha állag, ideális idős vagy igényes kutyáknak\n- Könnyen adagolható',
    },
  ],
  kutyakiegeszitok: [
    {
      name: 'Kong Classic gumijáték L', price: 4990, stock: 30,
      description: '**Méret:** L (25–40 kg-os kutyáknak) | **Anyag:** természetes gumi\n\nA világ legismertebb kutya interaktív játéka, jutalomfalattal tölthető.\n\n- Természetes kaučuk, rendkívül tartós\n- Fogkő és fogas unalom ellen\n- Mosogatógépben mosható',
    },
    {
      name: 'Trixie nylon nyakörv L 45-70 cm', price: 1990, stock: 55,
      description: '**Méret:** L, állítható 45–70 cm | **Anyag:** nylon\n\nErős, állítható nylon nyakörv biztonsági csattal.\n\n- Gyors kioldású műanyag csat\n- 25 mm széles szalag\n- Mosható, tartós anyag',
    },
    {
      name: 'Flexi New Comfort póráz 5m L', price: 5490, stock: 22,
      description: '**Hossz:** 5 m | **Befogadóképesség:** max. 50 kg\n\nErgonomikus fogantyújú, visszahúzható szalagpóráz.\n\n- Kényelmes, puha fogantyú\n- Egygombos fékezési és rögzítési rendszer\n- Cserélhető belső alkatrészek',
    },
    {
      name: 'Ferplast Siesta Deluxe 6 fekhely', price: 8990, stock: 18,
      description: '**Méret:** 6-os (80 × 55 cm) | **Anyag:** műanyag + puha párna\n\nOválist formájú, kényelmes fekhely eltávolítható párnával.\n\n- Mosható párnabetét\n- Csúszásgátló alap\n- Könnyen tisztítható műanyag keret',
    },
    {
      name: 'Karlie szőr-kefe dupla oldalú', price: 2490, stock: 40,
      description: '**Típus:** kétoldalas szőr- és masszázskefe\n\nAz egyik oldal tüskés szőrkefe, a másik természetes sörtéjű masszázskefe.\n\n- Csökkenti a szőrhullást\n- Kényelmes, ergonomikus fogóval\n- Minden szőrtípushoz alkalmas',
    },
    {
      name: 'Trixie fogkefe szett kutyának', price: 1490, stock: 35,
      description: '**Tartalom:** 1 db fogkefe + ujjra húzható fogkefe\n\nRendszeres fogápoláshoz, kutyabarát kialakítással.\n\n- Puha szőrök a fogzománcot kímélve\n- Ujjra húzható változat a kezdőknek\n- Fogíny és fogközök alapos tisztítása',
    },
    {
      name: 'Ruffwear Web Master hám L', price: 19990, stock: 10,
      description: '**Méret:** L (69–81 cm mellkas) | **Anyag:** nylon webbing\n\nProfi, 5 pontos fogással rögzített biztonsági hám aktív kutyáknak.\n\n- Beépített fogantyú segítségnyújtáshoz\n- Fényvisszaverő csíkok sötétben\n- Tökéletes terelőkutyák és túrázók számára',
    },
  ],
  macskaeledel: [
    {
      name: 'Royal Canin Indoor Adult 4 kg', price: 8990, stock: 50,
      description: '**Tömeg:** 4 kg | **Ajánlott:** lakásban élő felnőtt macskák\n\nKevésbé aktív, beltéren élő macskák energiaszükségletéhez igazított formula.\n\n- Csökkentett kalóriatartalom a testsúlykontrollért\n- Psyllium és rostok a szőrlabda megelőzéséért\n- Zeolite a szagtalan alom érdekében',
    },
    {
      name: "Hill's Science Plan Sterilised 8 kg", price: 14990, stock: 25,
      description: '**Tömeg:** 8 kg | **Ajánlott:** ivartalanított felnőtt macskák\n\nSpeciálisan ivartalanított macskák számára, csökkentett kalóriatartalommal.\n\n- L-karnitin az egészséges testsúlyért\n- Kiegyensúlyozott ásványi anyag arány\n- Klinikai vizsgálatokkal alátámasztva',
    },
    {
      name: 'Purina ONE Adult Chicken 7.5 kg', price: 9490, stock: 38,
      description: '**Tömeg:** 7.5 kg | **Ajánlott:** felnőtt macskák, 1 évtől\n\nCsirkével és búzával, rácsszerű szemcsékkel a fogakért.\n\n- 34% fehérjetartalom\n- Omega-6 zsírsavak a ragyogó szőrzetért\n- Nincs mesterséges színezék',
    },
    {
      name: 'Whiskas Alive nedves macskaeledel 12x85g', price: 2190, stock: 70,
      description: '**Tömeg:** 12 × 85 g | **Változatok:** hal, csirke, marha\n\nIzmos, szaftban úszó falatokból álló prémium nedves táp.\n\n- 12 tasak mix ízesítéssel\n- Könnyen nyitható alu-tasak\n- Kiegészítő ásványi anyagok és vitaminok',
    },
    {
      name: 'Animonda Carny Adult Beef 400g', price: 790, stock: 90,
      description: '**Tömeg:** 400 g | **Ajánlott:** felnőtt macskák\n\nNedves marha-alaptáp természetes összetevőkkel, mártásban.\n\n- Magas marhahústartalom (75%)\n- Gabonamentes recept\n- Könnyen emészthető',
    },
    {
      name: 'Brit Care Grain-free Adult Salmon 7 kg', price: 12490, stock: 20,
      description: '**Tömeg:** 7 kg | **Ajánlott:** felnőtt macskák, gabonaérzékenyek\n\nÉdes burgonyával és lazaccal készített gabonamentes száraztáp.\n\n- Omega-3 zsírsavak lazacból\n- Nincs búza, kukorica, szója\n- Prebiotikumok az emésztőrendszerért',
    },
    {
      name: 'Dreamies Tuna snack 180g', price: 1290, stock: 100,
      description: '**Tömeg:** 180 g | **Ízesítés:** tonhal\n\nRopogós külső, lágy belső jutalom falat – macskák kedvence.\n\n- Mindössze 2 kcal/db\n- Ideális jutalomként és kézből etetésre\n- Adagolható tasakban',
    },
  ],
  macskakiegeszitok: [
    {
      name: 'Trixie Parla kaparószékhegy 163 cm', price: 14990, stock: 12,
      description: '**Magasság:** 163 cm | **Anyag:** szizál, plüss\n\nStabilis, több szintes kaparótorony fekvőhelyekkel és játékokkal.\n\n- 3 db fekvőemelvény\n- Sisal kötélborítású kaparószár\n- Erős alap, nem billen',
    },
    {
      name: 'Ferplast Bella Maxi alomdoboz', price: 5490, stock: 25,
      description: '**Méret:** 58 × 48 × 24 cm | **Anyag:** polipropilén\n\nNagyméretű, fedél nélküli alomdoboz szűrőhálóval.\n\n- Mélyen kialakított fal kevesebb szóródásért\n- Könnyen tisztítható sima felület\n- Stabil, csúszásgátló alap',
    },
    {
      name: 'Catit Design Senses labdapálya', price: 4990, stock: 18,
      description: '**Típus:** interaktív labdapálya | **Kompatibilis:** minden macska\n\nSzabadtéri labirintus labdával, macskamentával és zuhanyfejjel.\n\n- Bővíthető moduláris rendszer\n- Önkéntes aktivitást serkent\n- Nincs szükség elemre',
    },
    {
      name: 'Pet Interactives toll játék', price: 990, stock: 60,
      description: '**Típus:** kézi toll játék | **Anyag:** fa nyél, tollak\n\nEgyszerű, de rendkívül hatékony vadász-ösztönt felkeltő játék.\n\n- Természetes tollak\n- 60 cm-es rugalmas drót\n- Ideális interaktív játékra',
    },
    {
      name: 'Trixie Harvey barlang fekhely 45 cm', price: 7990, stock: 15,
      description: '**Átmérő:** 45 cm | **Anyag:** plüss\n\nPuha, zárt barlang fekhely félénk és hidegben szerető macskáknak.\n\n- Eltávolítható, mosható párna\n- Rejtett belső tér a biztonságérzetért\n- Könnyen összenyomható szállításhoz',
    },
    {
      name: 'Hagen Catit szökőkút 2 L', price: 9990, stock: 20,
      description: '**Kapacitás:** 2 liter | **Zajszint:** csendes szivattyú\n\nFolyamatosan friss, szűrt vizet biztosít a macska számára.\n\n- Aktív szénszűrő ionok és szagok ellen\n- 3 különböző vízfolyás-beállítás\n- BPA-mentes anyagból',
    },
    {
      name: 'Van Ness PP4 macskatoalett fedővel', price: 3990, stock: 30,
      description: '**Méret:** 51 × 38 × 43 cm | **Anyag:** polipropilén\n\nFedett, szagzáró macskatoalett szénszűrős szellőzőnyílással.\n\n- Levehető fedél a kényelmes tisztításhoz\n- Beépített szénszűrő szag ellen\n- Csúszásgátló alap',
    },
  ],
  hulloeledel: [
    {
      name: 'Zoo Med ReptiSticks pokhálós gomba 55g', price: 2990, stock: 25,
      description: '**Tömeg:** 55 g | **Ajánlott:** mindenevő és növényevő hüllők\n\nSzárított pokhálós gomba és egyéb zöldség rudak hüllőknek.\n\n- Magas rost- és vitamintartalom\n- Natúr, mesterséges adalékanyag nélkül\n- Ujjszerű forma könnyű adagoláshoz',
    },
    {
      name: 'Lucky Reptile Herp Diner szárított tücsök', price: 1990, stock: 40,
      description: '**Tömeg:** 35 g | **Ajánlott:** rovarevő hüllők, geckók\n\nSzárított tücsök magas fehérjetartalommal, liofilizált.\n\n- 65% nyersfehérje-tartalom\n- Szagtalanabb, mint az élő tücsök\n- Hosszú eltarthatóság',
    },
    {
      name: 'Exo Terra csincsilla-levél mix 15g', price: 1490, stock: 30,
      description: '**Tömeg:** 15 g | **Ajánlott:** leguánok, teknősök, zöld anoliszok\n\nSzárított trópusi levelek vitamindús, természetes eledelként.\n\n- Hibiszkusz, csincsilla és bodzalevél keverék\n- Gazdag antioxidánsokban\n- Stimuláló természetes táplálkozási élményt nyújt',
    },
    {
      name: 'Sera reptil Professional Herbivor 250ml', price: 2490, stock: 20,
      description: '**Térfogat:** 250 ml | **Ajánlott:** növényevő hüllők\n\nApró granulátum szárazföldi teknősöknek és növényevő gyíkoknak.\n\n- Dúsított vitaminok és ásványi anyagok\n- Magas rosttartalom az emésztésért\n- Nem duzzad fel vízben',
    },
    {
      name: 'JBL Tortil teknos granulátum 100 ml', price: 1790, stock: 35,
      description: '**Térfogat:** 100 ml | **Ajánlott:** vízi és szárazföldi teknősök\n\nKörszerű granulátum természetes összetevőkből teknősöknek.\n\n- Gamma-sugárzással sterilizált\n- Vitaminok és ásványi anyagok optimális arányban\n- Lassan süllyedő szemcsék a vízi fajokhoz',
    },
    {
      name: 'Repashy Crested Gecko diet 85g', price: 3990, stock: 22,
      description: '**Tömeg:** 85 g | **Ajánlott:** tarajos geckó és rokonai\n\nVízzel keverendő, teljes értékű pépes táp tarajos geckóknak.\n\n- Nem szükséges rovar kiegészítő\n- Gyümölcses alap természetes összetevőkkel\n- Könnyen elkészíthető 1:2 arányban vízzel',
    },
  ],
  hullokiegeszitok: [
    {
      name: 'Exo Terra Glass Terrarium 60x45x45', price: 34990, stock: 8,
      description: '**Méret:** 60 × 45 × 45 cm | **Anyag:** edzett üveg, alumínium\n\nProfi üveg terrárium kettős szellőzőhálóval és kinyitható ajtóval.\n\n- Elöl nyíló kettős ajtó könnyen hozzáférhetőségért\n- Alul kábelvezetési nyílás\n- Vízálló alap, száraz vagy nedves biotóp egyaránt',
    },
    {
      name: 'Lucky Reptile Bright Sun UV Desert 35W', price: 12990, stock: 15,
      description: '**Teljesítmény:** 35 W | **UV-B:** 12% | **Izzóforma:** E27\n\nKiváló UV-B sugárzású nappali fényviszonyokat imitáló metal-halid izzó.\n\n- D3-vitamin szintézist serkentő UV-B sugárzás\n- Természetes napsütés-szerű megvilágítás\n- 6000 K színhőmérséklet',
    },
    {
      name: 'Trixie Thermo Mat fűtőszőnyeg 28x28 cm', price: 4990, stock: 20,
      description: '**Méret:** 28 × 28 cm | **Teljesítmény:** 8 W\n\nVékony, aljzat alá vagy mellé helyezhető fűtőszőnyeg hüllőknek.\n\n- Egyenletes hőeloszlás\n- Nedvességálló kialakítás\n- Automatikus termosztát-csatlakoztatás lehetséges',
    },
    {
      name: 'Exo Terra Coco Husk 8L aljzat', price: 2990, stock: 45,
      description: '**Térfogat:** 8 L (tömörített, kb. 2–3× duzzad) | **Anyag:** kókuszdió-héj\n\nNaturális, nedvességtartó kókuszrost aljzat trópusi és nedvességkedvelő fajoknak.\n\n- 100% természetes, vegyszermentesen feldolgozott\n- Kiváló páratartalom-szabályozás\n- Komposzálható',
    },
    {
      name: 'Sera Reptil Basking Spot lámpa 75W', price: 1990, stock: 30,
      description: '**Teljesítmény:** 75 W | **Típus:** izzó, E27 foglalat\n\nIntenzív melegítő spotlámpa napozósáv kialakításához.\n\n- Szűk fókuszú fényszóró a melegítési pont koncentrálásához\n- UVA sugárzással a természetes viselkedés serkentéséért\n- Optimális az emésztési aktivitáshoz',
    },
    {
      name: 'Zoo Med HygroTherm digitális termosztát', price: 14990, stock: 10,
      description: '**Típus:** digitális páratartalom- és hőmérséklet-szabályozó\n\nEgyidejű hőmérséklet és páratartalom vezérlés termosztát és higrosztat funkcióval.\n\n- Kettős kijelző (Celsius és %RH)\n- Riasztás hőmérséklet-kiesés esetén\n- Max. 1000 W terhelhetőség',
    },
  ],
  ragcsaloeledel: [
    {
      name: 'Versele-Laga Nature Hamster 700g', price: 1990, stock: 55,
      description: '**Tömeg:** 700 g | **Ajánlott:** arany- és törpehörcsögök\n\nNatúr magkeverék gyümölcsökkel, zöldségekkel és rovarfehérjével.\n\n- Magas rosttartalom\n- Szárított gyümölcs és zöldség természetes kiegészítőként\n- Egyensúlyban tartja a bélflórát',
    },
    {
      name: 'Vitakraft Menu Vital tengerimalac 4 kg', price: 4490, stock: 30,
      description: '**Tömeg:** 4 kg | **Ajánlott:** tengerimalacok\n\nMagasc-vitaminos, szálas zöldségekből álló komplex táp.\n\n- C-vitamin dúsítás (tengerimalacok nem termelik)\n- Rostban gazdag széna és zöldséges keverék\n- Pellet és természetes összetevők kombinációja',
    },
    {
      name: 'Supreme Science Selective nyúl 1.5 kg', price: 3490, stock: 35,
      description: '**Tömeg:** 1.5 kg | **Ajánlott:** felnőtt nyulak\n\nMono-komponensű pellet – nem válogatható szét, teljes értékű.\n\n- 25% nyers rosttartalom\n- Prebiotikumok a bélrendszerért\n- Nem tartalmaz cukrot vagy gabonaféléket',
    },
    {
      name: 'Beaphar Care plusz patkány 1.5 kg', price: 2990, stock: 25,
      description: '**Tömeg:** 1.5 kg | **Ajánlott:** díszpatkányok\n\nKiegyensúlyozott pellet táp patkányok egészséges életéért.\n\n- Magas fehérjetartalom aktív rágcsálóknak\n- Ásványi anyagok az erős csontokért\n- Omega zsírsavak a szőrzetért',
    },
    {
      name: 'JR Farm Grassli széna 600g', price: 1290, stock: 70,
      description: '**Tömeg:** 600 g | **Típus:** friss kaszálású hegyi rét széna\n\nIlatos, hosszúszálú széna nyulaknak, tengerimalacoknak és csincsilláknak.\n\n- Napi szükségletnek megfelelő rosttartalom\n- Fogkoptatáshoz elengedhetetlen\n- Mesterséges szárítószer nélkül',
    },
    {
      name: 'Vitakraft Kracker rágcsáló', price: 990, stock: 80,
      description: '**Típus:** rágcsáló rudak | **Ízesítés:** méz-mag\n\nKétfogású rudacska fogkoptatáshoz és szórakoztatáshoz.\n\n- Természetes gabona és mag\n- Segít a fogkoptatásban\n- Akasztható a ketrecre',
    },
    {
      name: 'Vitapol Smakers papagáj-rúd mix', price: 890, stock: 65,
      description: '**Típus:** rágcsáló és madeár rúd | **Ízesítés:** gyümölcs-mag\n\nEgzotikus gyümölcsös rúd kisebb papagájoknak és rágcsálóknak.\n\n- Természetes magok, gyümölcsök és gabonák\n- Felerősíthető ketrec rácsára\n- Élénk elfoglaltságot biztosít',
    },
  ],
  ragcsalokiegeszitok: [
    {
      name: 'Ferplast Duna Fun Secret ketrec', price: 19990, stock: 10,
      description: '**Méret:** 46 × 29.5 × 37.5 cm | **Ajánlott:** hörcsögök, egerek\n\nKétemeletes, átlátszó falú műanyag ketrec beépített alagutas rendszerrel.\n\n- Moduláris alagút bővítési lehetőséggel\n- Eltávolítható tetőrács a könnyű takarításhoz\n- Mély aljzat a kotorékászi szükségletekért',
    },
    {
      name: 'Trixie Vitarium ketrec 80x50x50 cm', price: 24990, stock: 7,
      description: '**Méret:** 80 × 50 × 50 cm | **Ajánlott:** nyulak, tengerimalacok\n\nNagy alapterületű, erős rácsszerkezetű ketrec kivehető műanyag tálcával.\n\n- Huzamos fenntarthatóság erős acélhálóval\n- Mozgatható, összecsukható\n- Kényelmes oldalsó kapu',
    },
    {
      name: 'Savic Ivo 2 futókerék 27 cm', price: 3490, stock: 22,
      description: '**Átmérő:** 27 cm | **Anyag:** acél + műanyag\n\nNéma, nyílt futókerék hörcsögöknek, mókusoknak.\n\n- Csontváz nélküli dizájn lábsérülés ellen\n- Zajtalanul forog\n- Rácsra és aljzatra is rögzíthető',
    },
    {
      name: 'Nobby fajáték rágcsálóknak', price: 1490, stock: 50,
      description: '**Anyag:** natúr nyírfa | **Típus:** rágójáték szett\n\nTermészetes fából készült rágójátékok fogkoptatáshoz.\n\n- Kezeletlen, festékmentes fa\n- Különböző formák és textúrák\n- A fogazat természetes koptatásához',
    },
    {
      name: 'Ferplast Sippy ital-automata 300ml', price: 1990, stock: 40,
      description: '**Kapacitás:** 300 ml | **Típus:** cseppmentes ital-automata\n\nRácsos ital-automata rozsdamentes ivócsővel, cseppmentes.\n\n- Könnyen tölthető felső nyílással\n- Rozsdamentes acél ivócső csíramentesen\n- Átlátszó tartály a szintfelügyeletre',
    },
    {
      name: 'Trixie Sandy homokalapáz tengerimalacnak', price: 2490, stock: 30,
      description: '**Méret:** 22 × 17 cm | **Anyag:** műanyag\n\nFürdőhomok-tálca kisebb rágcsálóknak, csincsillának, egereknek.\n\n- Mélyen profilált oldalak a szóródás ellen\n- Átlátszó, könnyen ellenőrizhető\n- BPA-mentes anyag',
    },
    {
      name: 'Zolux Woody térbővítő alagút', price: 3990, stock: 18,
      description: '**Anyag:** természetes fenyőfa | **Kompatibilis:** hörcsög, egér, patkány\n\nFából készült, moduláris alagútrendszer bővítő elem.\n\n- Natúr, kezeletlen fa\n- Csatlakoztatható más Woody elemekhez\n- Természetes rejtőzési és rágási lehetőség',
    },
  ],
};

const categoryVisuals = {
  kutyaeledel:       { a: '#f59e0b', b: '#f97316', tag: 'DOG FOOD' },
  kutyakiegeszitok:  { a: '#06b6d4', b: '#2563eb', tag: 'DOG GEAR' },
  macskaeledel:      { a: '#ec4899', b: '#be185d', tag: 'CAT FOOD' },
  macskakiegeszitok: { a: '#8b5cf6', b: '#6d28d9', tag: 'CAT GEAR' },
  hulloeledel:       { a: '#10b981', b: '#059669', tag: 'REPTILE FOOD' },
  hullokiegeszitok:  { a: '#0ea5e9', b: '#1d4ed8', tag: 'REPTILE GEAR' },
  ragcsaloeledel:    { a: '#84cc16', b: '#65a30d', tag: 'RODENT FOOD' },
  ragcsalokiegeszitok: { a: '#f43f5e', b: '#be123c', tag: 'RODENT GEAR' },
};

function makeProductSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function initialsFor(name) {
  const chars = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return chars || 'PP';
}

function createProductSvg({ name, categorySlug, index }) {
  const visual = categoryVisuals[categorySlug] || { a: '#22c55e', b: '#16a34a', tag: 'PET PRODUCT' };
  const initials = initialsFor(name);
  const cx = 140 + (index % 5) * 6;
  const cy = 130 + (index % 4) * 8;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${visual.a}" />
      <stop offset="100%" stop-color="${visual.b}" />
    </linearGradient>
  </defs>
  <rect width="640" height="640" fill="url(#bg)" />
  <circle cx="${cx}" cy="${cy}" r="170" fill="rgba(255,255,255,0.18)" />
  <circle cx="520" cy="540" r="150" fill="rgba(255,255,255,0.12)" />
  <rect x="40" y="438" width="560" height="160" rx="20" fill="rgba(0,0,0,0.18)" />
  <text x="320" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="700" fill="rgba(255,255,255,0.95)">${escapeXml(initials)}</text>
  <text x="320" y="506" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="white">${escapeXml(visual.tag)}</text>
  <text x="320" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">${escapeXml(name.substring(0, 36))}</text>
  <text x="320" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.85)">Local demo image</text>
</svg>`;
}

function generateLocalProductImages() {
  const imageDir = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'images', 'products');
  fs.mkdirSync(imageDir, { recursive: true });

  for (const [categorySlug, products] of Object.entries(productsByCategory)) {
    products.forEach((product, index) => {
      const productSlug = makeProductSlug(product.name);
      const svg = createProductSvg({
        name: product.name,
        categorySlug,
        index,
      });
      fs.writeFileSync(path.join(imageDir, `${productSlug}.svg`), svg, 'utf8');
    });
  }
}

/**
 * Adatbázis feltöltése. Opcionálisan fogad külso Sequelize/Model referenciákat
 * (teszteléshez), különben a src/models-ből importált alapértelmezett modelleket használja.
 */
async function seed(options = {}) {
  const seq  = options.sequelize || sequelize;
  const Cat  = options.Category  || Category;
  const Prod = options.Product   || Product;

  generateLocalProductImages();

  await seq.sync({ force: true });

  const catMap = {};
  for (const c of categories) {
    const cat = await Cat.create(c);
    catMap[cat.slug] = cat.id;
  }

  let total = 0;
  for (const [slug, products] of Object.entries(productsByCategory)) {
    const category_id = catMap[slug];
    let idx = 0;
    for (const p of products) {
      const productSlug = makeProductSlug(p.name);
      const image_url = `/images/products/${productSlug}.svg`;
      await Prod.create({ ...p, slug: productSlug, category_id, is_active: true, image_url });
      idx++;
      total++;
    }
  }

  return { categories: categories.length, products: total };
}

module.exports = { seed, categories, productsByCategory };

if (require.main === module) {
  seed()
    .then(({ categories: c, products: p }) => {
      console.log(`\n Seed kész – ${p} termék, ${c} kategória`);
      return sequelize.close();
    })
    .catch((err) => {
      console.error('Seed hiba:', err);
      process.exit(1);
    });
}