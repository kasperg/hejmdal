[![NSP Status](https://nodesecurity.io/orgs/dbcdk/projects/4eba54f1-c2ff-4d1e-ab6f-80ae788ec29c/badge)](https://nodesecurity.io/orgs/dbcdk/projects/4eba54f1-c2ff-4d1e-ab6f-80ae788ec29c)
[![David](https://img.shields.io/david/DBCDK/hejmdal.svg?style=flat-square)](https://david-dm.org/DBCDK/hejmdal#info=dependencies)
[![David](https://img.shields.io/david/dev/DBCDK/hejmdal.svg?style=flat-square)](https://david-dm.org/DBCDK/hejmdal#info=dev)
[![bitHound Overall Score](https://www.bithound.io/github/DBCDK/hejmdal/badges/score.svg)](https://www.bithound.io/github/DBCDK/hejmdal)
[![Build Status](https://travis-ci.org/DBCDK/hejmdal.svg?branch=master)](https://travis-ci.org/DBCDK/hejmdal)

# hejmdal
*Heimdall eller Hejmdal (norrønt: Heimdallr) [...] har en fantastisk hørelse, og optræder af den grund i myterne som gudernes vagtmand, der sidder ved enden af Bifrost og overvåger, at ingen jætter sniger sig ind i Asgård.*
[Wikipedia](https://da.wikipedia.org/wiki/Hejmdal)

##Releases
Releases findes på GitHub under [/releases](https://github.com/DBCDK/hejmdal/releases), hvor der under hver enkelt release linkes til en changelog for den givne release. Desuden findes der en samlet changlog i filen [CHANGELOG.md](https://github.com/DBCDK/hejmdal/blob/master/CHANGELOG.md) i roden af projektet.

##Opstart
###Udvikling
Efter repositortiet er bevet klonet og afhængigheder er blevet installeret med `npm install` kan applikationen startes med `npm run dev`. Denne kommando starter applikationen med [nodemon](https://www.npmjs.com/package/nodemon) der sikre genstart af applikationen når kode er ændres.

For at køre med en lokal database installeres postgres. Bruger, password og database sættes via environment variabler.

###Produktion
I produktion vil opstarten afhænge af hvilke værktøjer der benyttes men i sin reneste form kan applikationen startes med `node src/main.js` fra roden af projektet. 

###Migrering###
For at installere de seneste database opdateringer køres `npm run migrate:latest`. Denne kommando skal også køres, når man installerer projektet første gang.
 
I et udviklingsmiljø kan køres `npm run migrate:latest:dev` som samtidig vil source en env.env fil.
  
##Eksempelapplikation
Fra forsiden linkes der til en eksempelapplikation, som kan demonstrere flowet ifm. login via adgangsplatformen.  
I felterne indsættes den nødvendige information (URL, sti og token) hvorefter forespørgslen kan sendes afsted. Ved successfuldt login er det muligt at få vist den pågældende ticket i browseren.

##Tests

### Unittests
Testsuiterne afvikles generelt med kommandoen `npm run test` der er specificeret i `package.json`.  
Skal der testes i et CI miljø på f.eks. Jenkins skal environment variablen `JUNIT_REPORT_PATH` sættes til den ønskede destination. F.eks. `JUNIT_REPORT_PATH=/report.xml npm run test`  
Bemærk at `npm run test` køres med `LOG_LEVEL=OFF` hvilket betyder at logning er slået fra under test.  
Se iøvrigt [mocha-jenkins-reporter](https://www.npmjs.com/package/mocha-jenkins-reporter)

### Integrationstests
Integrationstests køres med selenium ligger i selenium/tests. Testene afvikles med commandoen `npm run test:integration`. De afvikles via saucelabs og kræver at `SAUCE_USERNAME` og `SAUCE_ACCESS_KEY` er sat.  
Testene kan også afvikles på en lokal seleniumserver med kommandoen `npm run test:integration:local` som sætter `TEST_ENV=local`. 

##Logning
Der logges til `stdout` med de levels der er specificeret i afsnittet om [environment variabler](https://github.com/DBCDK/hejmdal#environment-variabler) herunder.

##Environment variabler
- `BORCHK_URI` : `borchk.uri`  
Adressen på den aktuelle version at borchk servicen

- `CULR_WSDL_URI` : `culr.hash`  
URL til CULR WSDL

- `CULR_USER_ID_AUT` : `culr.userIdAut`  
CULR autentificerings ID

- `CULR_GROUP_ID_AUT` : `culr.groupIdAut`  
CULR autentificerings gruppe ID

- `CULR_PASSWORD_AUT` : `culr.passwordAut`  
CULR autentificerings password

- `CULR_PROFILE_NAME` : `culr.profileName`  
CULR profilnavn

- `GC_SESSION_DIVISOR` : `divisor`  
Den reciprokke værdi for hvor ofte sessions bliver garbage collected. Væredien 1 vil garbage collecte sessions for hver forespørgsel

- `GC_SESSION_SECONDS` : `seconds`  
Antal sekunder en session skal være ældre end for at blive garbage collected. Der defaultes til 3600 (1 time)

- `GC_TICKET_DIVISOR` : `divisor`  
Den reciprokke værdi for hvor ofte tickets bliver garbage collected. Væredien 1 vil garbage collecte tickets for hver forespørgsel

- `GC_TICKET_SECONDS` : `seconds`  
Antal sekunder en ticket skal være ældre end for at blive garbage collected. Der defaultes til 2678400 (31 dage)

- `HASH_SHARED` : `hash.shared`  
Hash salt secret, som bruges generelt til at danne (og tjekke) hash nøgler

- `HEJMDAL_DB_CONNECTIONS_POOL_MAX` : `max`  
Maximum connections in pool

- `HEJMDAL_DB_CONNECTIONS_POOL_MIN` : `min`  
Minimum connections in pool

- `HEJMDAL_DB_HOST` : `host`  
Database host

- `HEJMDAL_DB_NAME` : `database`  
Navn på hejmdals database

- `HEJMDAL_DB_USER` : `user`    
Database bruger

- `HEJMDAL_DB_USER_PASSWORD` : `password`  
Password til hejmdal database bruger

- `LOG_LEVEL` : `level`  
Specificere hvilket maximum loglevel applikationen skal bruge. Default: `INFO`
Følgende levels kan bruges: `OFF` (0), `ERROR` (1), `WARN` (2), `WARNING` (2), `INFO` (3), `DEBUG` (4), `TRACE` (5)

- `MOCK_BORCHK`: `borchk`
Sættes værdien til `0` (`MOCK_BORCHK=0`) vil borchk ikke blive mocket ud. Alle andre værdier vil resultere i at borchk mockes.

- `MOCK_CONSENT_STORAGE` : `mock_external.consent`  
Sættes til 'memory' hvis det ønskes at mocke persistent storage ud med memory storage

- `MOCK_CULR` : `mock_external.culr`  
Sættes værdien til `1` (`MOCK_CULR=1`) vil CULR blive mocket ud. Alle andre værdier vil resultere i at CULR ikke mockes.

- `MOCK_OPENAGENCY`: `mock_external.openAgency`
Sættes værdien til `0` (`MOCK_OPENAGENCY=0`) vil openAgency ikke blive mocket ud. Alle andre værdier vil resultere i at openAgency mockes.

- `MOCK_TICKET_STORAGE` : `mock_external.ticket`  
Sættes til 'memory' hvis det ønskes at mocke persistent storage ud med memory storage

- `MOCK_SMAUG` : `mock_external.smaug`  
Sættes værdien til `0` (`MOCK_SMAUG=0`) vil Smaug ikke blive mocket ud. Alle andre værdier vil resultere i at Smaug mockes.
 
- `MOCK_WAYF` : `mock_external.wayf`  
Sættes værdien til `0` (`MOCK_WAYF=0`) vil WAYF ikke blive mocket ud. Alle andre værdier vil resultere i at WAYF mockes.
 
- `NODE_ENV` : `app.env`  
Når applikationen køres i produktion bør `NODE_ENV` sættes til `production`: `NODE_ENV=production`
 
- `OPENAGENCY_URI` : `openAgency.uri`  
Adressen på den aktuelle version at openAgency servicen

- `PORT` : `app.port`  
Specificere hvilken port applikatioen skal være tilgængelig på. Default: `3010`

- `PRETTY_LOG` : `pretty`  
Sættes værdien til "1" (`PRETTY_LOG=1`) pretty printes log statements. Alle andre værdier vil resultere i at logstatements printes enkeltvis på én linje.
 
- `SESSION_LIFE_TIME` : `session.life_time`  
Specificere en brugers sessions levetid. Default er 24 timer. Værdien er et tal og skal angives i millisekunder f.eks. er 24 timer = 86400000 (60 * 60 * 24 * 1000)

- `SMAUG_URI` : `https adresse`  
Adressen på den aktuelle version af smaug servicen

- `SAUCE_USERNAME` : `brugernavn`  
Gyldig brugernavn til saucelabs

- `SAUCE_ACCESS_KEY` : `access key`  
Gyldig access key til saucelabs

- `TEST_ENV` : `local`  
sættes til local for at afvikle selenium lokalt. Default er saucelabs.


# Dokumentation
## Endpoints
- `/login?token=ABC_123&returnurl=someRelativeCallBackUrl` 
Login URL. Hvis token parameteren ikke er sat bliver der smidt en `403` fejl. returnurl indeholder den relative url som login resultatet skal sendes til
- `/logud` eller `/logud?redirect=URL` 
En brugers session på login.bib.dk fjernes og hvis `?redirect` parameteren er sat redirected browseren til den givne URL. Alternativt bliver browseren på login.bib.dk og der vises en kort besked om at brugeren er logget ud. 

