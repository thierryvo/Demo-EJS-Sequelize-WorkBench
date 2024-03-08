// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: app.js
// git         : https://github.com/RaddyTheBrand/Nodejs-User-Management-Express-EJS-MongoDB
// flash       : https://raddy.dev/blog/user-management-system-nodejs-express-mongodb-ejs-crud/
// SEQUELIZE:
// ==========
// doc: https://sebhastian.com/tags/sequelize/
//      https://sebhastian.com/sequelize-findone/     
//
// test        :  node app.js
//                npm run dev          => lance nodemon, en Utilisant les scripts de package.json ***
// DESCRIPTION :  http://localhost:3000/demo-seq/user
//
// installation: npm install express dotenv ejs
//               npm install mysql2 sequelize joi
//               npm install express-session connect-flash express-fileupload cookie-parser
//               npm install express-ejs-layouts express-fileupload method-override
//               npm install bcryptjs jsonwebtoken joi                         
//
//               npm install nodemon --save-dev                                                                                                
// ==========================================================================================================
// import des modules nécessaires
const express = require('express')
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
require('dotenv').config({path: './serveur/config/.env'})

/*****************************************/
/* Initialisation de l'API (du serveur)  */
const appServeur = express();

/*****************************************/
/* Mise en place du paramétrage          */
  appServeur.use(express.json());
  appServeur.use(methodOverride('_method'));
  appServeur.use(express.urlencoded({ extended: true }));
  appServeur.use(express.static('public'));                   // static Files: dans public; Dont: css/main.css
  appServeur.use(cookieParser('DemoSeqSecure'));
  appServeur.use(session({
    secret: 'DemoSeqSecretSession',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }    
  }));
  appServeur.use(flash({ sessionKeyName: 'flashMessage' }));
  appServeur.use(fileUpload());
  // Moteur de création de modèles (templating Engine)
  appServeur.use(expressLayouts);
  appServeur.set('layout', './layouts/main');
  appServeur.set("view engine", "ejs")

/*****************************************/
/* Mise en place du routage              */
appServeur.get('/', (req, res) => res.send("Je suis en ligne ("+serveurnom+"). Tout est OK pour l'instant sur la racine slash /."));
// user: '/demo-seq/user'
const urlprefixe_appli = process.env.URL_PREFIXE_APPLI;
const urlprefixe_user  = process.env.URL_PREFIXE_USER;
const url_user = urlprefixe_appli + urlprefixe_user;
const userRoutes = require('./serveur/routes/user-routes.js')
// jwt * : * sur toutes les routes !
const {checkUser, exigerAuthentification} = require('./serveur/middlewares/auth.middleware.js');
//appServeur.get('*', checkUser);
appServeur.get('/jwtid', exigerAuthentification,  (req, res) => res.status(200).send(res.locals.user.id));
//
appServeur.use(url_user, userRoutes);
//
// 404
appServeur.get('*', (req, res) => {
  // non trouvé
  const urlIndex = urlprefixe_appli + urlprefixe_user     + '/'               // "/demo-seq/user/"
  const urlRecherche = urlprefixe_appli + urlprefixe_user + '/user-recherche' // "/demo-seq/user/user-recherche"
  const urlabout = urlprefixe_appli + urlprefixe_user     + '/about'          // "/demo-seq/user/about"
  res.status(404).render('PAGE404', {urlIndex, urlRecherche, urlabout});      // 404 NON Trouvé
  //res.status(501).send("Qu'est-ce que tu fais bon sang de bois!?!");        // 501 ressource non implémenté
});

/******************************************************************/
/* Démarrer la connexion BASE DE DONNEES    (mysql)               */
const Db  = require('./serveur/models/database.js') 
Db.sync()
.then((console.log("Connexion à la Base de DONNEES mysql2 réussie.")))
.catch(error => console.log(error))

/******************************************************************/
/* Démarrer le serveur: sur port 3000                             */
const port = process.env.PORT; // 3000;
const serveurnom = process.env.SERVEURNOM; // DEMO-SEQ
appServeur.listen(port, () => {
    console.log("SERVEUR: " + serveurnom + ", demarré sur l'url: http://localhost:"+port);
});
