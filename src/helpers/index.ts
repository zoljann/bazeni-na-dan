import env from '@/utility/env';

export const faqData = {
  guests: [
    {
      q: 'Da li rezervaciju radim preko web stranice ili telefonom?',
      a: 'Stranica služi da pronađeš bazen i vidiš sve informacije o njemu. Samu rezervaciju završavaš direktno s domaćinom – najčešće pozivom ili dogovorom preko kontakta koji je naveden u pregledu bazena.'
    },
    {
      q: 'Kako provjeravam da li je termin slobodan?',
      a: 'Ako je domaćin uključio kalendar dostupnosti, na dnu pregleda bazena vidiš slobodne i zauzete datume. Ako kalendara nema, provjeru termina radiš direktno s domaćinom putem kontakta navedenog u pregledu bazena.'
    },
    {
      q: 'Koliko ljudi mogu povesti?',
      a: 'Svaki bazen ima naznačen maksimalan broj gostiju u profilu. Ako planiraš dovesti više ljudi od navedenog, najbolje je unaprijed provjeriti s domaćinom i dogovoriti eventualne izmjene.'
    },
    {
      q: 'Da li mogu partijati na bazenu?',
      a: 'Prvo provjeri filtere i opcije na pregledu bazena, kao i ono što je domaćin naveo u opisu. Ako i dalje nisi siguran, dodatno provjeri s domaćinom prije nego što dogovorite termin.'
    },
    {
      q: 'Šta ako moram otkazati dolazak?',
      a: 'Ako ti se promijene planovi, obavijesti domaćina što je prije moguće koristeći kontakt podatke iz profila bazena. Svaki bazen može imati vlastita pravila otkazivanja, zato ih pročitaj prije dogovora i poštuj ono što ste se dogovorili.'
    },
    {
      q: 'Kontakt administracije web stranice',
      a: `Ako imaš problem, prijedlog ili trebaš pomoć oko korištenja stranice, kontaktiraj administraciju putem emaila: ${env.adminEmailAddress}. Odgovor možeš očekivati u najkraćem mogućem roku.`
    }
  ],
  hosts: [
    {
      q: 'Šta mi je potrebno da bih postao domaćin?',
      a: 'Registruješ se na web stranici i kroz nekoliko jednostavnih koraka dodaš svoj bazen: fotografije, opis, pravila i osnovne informacije. Nakon objave možeš odmah pregledati svoj bazen.'
    },
    {
      q: 'Kako upravljam bazenom?',
      a: 'Nakon objave možeš u svakom trenutku uređivati profil bazena: dodavati i brisati fotografije, mijenjati opis, pravila, cijene i maksimalan broj gostiju. Ako uključiš kalendar dostupnosti, označavaš zauzete i slobodne dane po potrebi. Također možeš jednostavno poslati link svog bazena potencijalnim gostima kako bi odmah vidjeli dostupne termine bez dodatnih upita/poziva.'
    },
    {
      q: 'Kako gosti pronalaze moj bazen?',
      a: 'Gosti pretražuju bazene po gradovima, filtrima i terminima, upoređuju fotografije, opise i pravila, i tako dolaze do tvog bazena. Što je profil sređeniji (dobre fotografije, jasan opis, jasna pravila), to ćeš dobiti više pregleda i poziva.'
    },
    {
      q: 'Kako gosti rezervišu moj bazen?',
      a: 'Rezervacije se ne rade preko web stranice. Gosti te kontaktiraju direktno putem kontakta navedenog u profilu bazena i s tobom dogovaraju termin i uslove. Ako koristiš kalendar dostupnosti, nakon dogovora jednostavno označiš dan kao zauzet i ostalim posjetiocima je odmah jasno kada je bazen slobodan.'
    },
    {
      q: 'Da li postoji provizija ili dodatni troškovi?',
      a: 'Ne uzimamo proviziju po rezervaciji. Plaćaš samo simboličnu mjesečnu naknadu da bi tvoj bazen bio vidljiv gostima. Cilj stranice je okupiti sve bazene u BiH na jednom mjestu kako bi domaćini lakše dolazili do novih gostiju — a gosti lakše pronašli dostupne bazene za željene termine.'
    }
  ]
};
