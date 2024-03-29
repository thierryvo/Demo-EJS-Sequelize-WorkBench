// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/routes/user-routes.js                                                                                               
// ==========================================================================================================
// import des modules necessaire
const userControleur = require('../controleurs/user-controleurs');

/*************************************************/
/*** Récupération du routeur d'express           */
const routeur = require('express').Router();

/*************************************************/
/*** Routage de la ressource User                */
// jwt * : 
const {checkUser, exigerAuthentification} = require('../middlewares/auth.middleware');
//
// login, logout
routeur.get('/auth', userControleur.soumettreAuthFormulaire);
routeur.post('/auth', userControleur.authUser);
routeur.get('/deco', userControleur.logoutUser);
//
routeur.get('/add', userControleur.soumettreAddFormulaire);
routeur.post('/add', userControleur.addUser);
// homepage: (acceuil) ici c'est un getAll avec pagination
routeur.get('/', userControleur.homepage);
//
// view, edit, delete
routeur.get('/view/:id', userControleur.getOne);
routeur.get('/edit/:id', exigerAuthentification, userControleur.soumettreUpdateFormulaire);
routeur.put('/edit/:id', exigerAuthentification, userControleur.updateOne);
routeur.delete('/edit/:id', exigerAuthentification, userControleur.deleteOne);
//
routeur.post('/user-recherche', userControleur.rechercheUsers);
routeur.get('/about', userControleur.about);
//
routeur.get('/lientest1', userControleur.lientest1);
routeur.get('/lientest2', exigerAuthentification,  userControleur.lientest2);
// 
module.exports = routeur;
