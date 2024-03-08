// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/routes/client-controleurs.js          
// doc: https://sebhastian.com/tags/sequelize/
//      https://sebhastian.com/sequelize-findone/                                                                                     
// ==========================================================================================================
// import des modules necessaire
const  User = require("../models/user");
const  User2 = require("../models/user2");
const  User3 = require("../models/user3");

// Authentificatioin et mot de passe
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {cvtDate} = require('../utils/gestionDates');
const {testCaracteres, encodageDeThierry, decodageDeThierry} = require('../utils/gestionCaractères');
const {validationAddUser, validationUpdateUser, validationAuthUser} = require('../utils/user-validation');

// GLOBAL:
const urlprefixe_appli = process.env.URL_PREFIXE_APPLI;
const urlprefixe_user  = process.env.URL_PREFIXE_USER;
const urlIndex = urlprefixe_appli + urlprefixe_user     + '/'               // "/demo-seq/user/"
const urlRecherche = urlprefixe_appli + urlprefixe_user + '/user-recherche' // "/demo-seq/user/user-recherche"
const urlabout = urlprefixe_appli + urlprefixe_user     + '/about'          // "/demo-seq/user/about"
const urlconnexion = urlprefixe_appli + urlprefixe_user       + '/auth'     // "/demo-seq/user/auth"
const urldeconnexion = urlprefixe_appli + urlprefixe_user     + '/deco'     // "/demo-seq/user/deco"

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------FORMULAIRE ejs + POST --------------------------------------------------
/*****************************************/
// GET  soumettreAddFormulaire
exports.soumettreAddFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');  
  const urlActionAdd = urlprefixe_appli + urlprefixe_user + '/add'               //  "/demo-user/user/add" 
  // AFFICHAGE DU FORMULAIRE DE SAISIE d'un USER
  // RENDRE la PAGE: user/add   --> qui va POSTER '/demo-user/user/add'
  let oUser = null;
  let derniereMAJour = '';
  if(tabDesDonnees.length === 0){ 
    // PREMIER PASSAGE: en création on est à blanc
    const unUser = {
      nom: '',
      prenom: '',
      pseudo: '',
      telephone: '',
      email: '',
      passe: '',
      detail: ''
    }
    oUser = unUser;
  }
  if(tabDesDonnees.length != 0){ 
    // AUTRES PASSAGES: Après redirection en erreur on rechage depuis le body
    const monTimeStamp = new Date().toLocaleString("fr");  // jj/mm/aaaa hh:mm:ss
    derniereMAJour = monTimeStamp.substring(1-1, 10);      // jj/mm/aaaa
    oUser = tabDesDonnees[0];
  }
  //
  const oTemplateData = {
    titre: "AJOUT USER",
    description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
    urlIndex: urlIndex,
    urlabout: urlabout,
    urlRecherche: urlRecherche,
    urlActionAdd: urlActionAdd,
    tabDesErreurs: tabDesErreurs,
    tabDesZones: tabDesZones,
    r_user: oUser
  }
  //
  // RENDRE le Formulaire: de SAISIE d'un user
  res.status(200).render("user/add", oTemplateData);
};  
/*****************************************/
// POST  addUser
exports.addUser = async (req, res) => {
  const urlActionAdd = urlprefixe_appli + urlprefixe_user + '/add'               //  "/demo-user/user/add" 
  const body = req.body;
  const {nom, prenom, pseudo, telephone, email, passe, detail} = req.body;
  // CONTROLE: le corps de la demande doit être au format { NOM: 'nom', PRENOM: 'prénom', ... }
  const {tabDesZones, message} = await validationAddUser(body);
  if(message != ""){
    // ERREUR + redirection + Transmission des données déjà saisie  
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', {
      nom: nom,
      prenom: prenom,
      pseudo: pseudo,
      telephone: telephone,      
      email: email, 
      passe: passe,
      detail: detail
    });    
    return res.redirect(urlActionAdd);
  }
  //
  // DATA OK:  
  const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
  const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
  const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
  const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj  
  //
  const DATE_CRT = bddDate;        // aaaammjj
  const DATE_CREATION = maDate;    // jj/mm/aaaa
  const HEURE_MODIFICA = monHeure; // hh:mm:ss
  const USER_CRT = pseudo;
  try {
    // CRYPTAGE OBLIGATOIRE du mot de passe:
    const oHash = await bcrypt.hash(passe, 8);
    const oHash2 = encodageDeThierry(passe);
    if(oHash === null){
      console.log('')
      console.log("addUser, ERREUR: dans le cryptag edu mo de passe")
      return res.send({message: "addUser, ERREUR: dans le cryptag edu mo de passe"});
    }
    // CREATION
    const unUser = {
      nom: nom,
      prenom: prenom,
      pseudo: pseudo,
      telephone: telephone,
      email: email,
      passe: oHash,
      detail: detail,
      DATE_CRT: DATE_CRT,
      DATE_CREATION: DATE_CREATION,
      HEURE_MODIFICA: HEURE_MODIFICA,
      USER_CRT: USER_CRT
    }
    const unPasse = {
      passe: oHash,
      passe2: oHash2
    }    
    const oo1 = await User.create(unUser);
    const oo2 = await User2.create(unPasse);
    //
    // FAIT: redirection sur index, avec message d'information
    if(oo1.dataValues.passe.length != 0 && oo2.dataValues.passe.length != 0){
      await req.flash("info", "Le user (" + nom +", " + prenom + ") a bien été créé.");
    } else {
      await req.flash("info", "Le user (" + nom +", " + prenom + ") n'a peut être pas été crééééé!!!  (voir la log)");
      console.log(oo1);
      console.log(oo2);
    }    
    res.redirect(urlIndex);
    // __________________________________________________________________________________________________________
  } catch (error) {
    // ERREUR
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - addUser() - " + 
                    " ajout - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";     
    console.log(message);
    await req.flash("infoErreur", message);
    res.redirect(urlIndex);
  }
};
// -----------------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------------
// -----------------------------------FORMULAIRE ejs + PUT ---------------------------------------------------
/*****************************************/
// GET  soumettreUpdateFormulaire: FORMULAIRE edit user
exports.soumettreUpdateFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');  
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const urlActionDelete = urlprefixe_appli + urlprefixe_user     + "/edit/"       // "/demo-user/user/edit/"    // + ID  
  // AFFICHAGE DU FORMULAIRE DE MODIFICATION d'un USER
  // RENDRE la PAGE: user/edit   --> qui va POSTER '/demo-user/user/edit/' + UID
  // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
  const id = req.params.id;
  let oUser = null;   // User base de donnée
  let unUser = null;  // User particulier pour le Formulaire
  let oPasse = null;  // Gestion mot de passe avec les tables user1 & user2  
  let derniereMAJour = '';  
  try {
    // ---Premier-passage-tvo.user1-----------------------------------------------------------------------------------------
    if(tabDesDonnees.length === 0){ 
      //
      // LECTURE du user
      const oOption = {
        attributes: {exclude: ['createdAt', 'updatedAt']}
      }
      oUser = await User.findByPk(id, oOption)
      if (oUser === null) {
        // MESSAGE: user NON trouvé, avec redirection à l'index
        await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
        return res.redirect(urlIndex);
      }
      oPasse = await User2.findOne({
        where: { passe: oUser.passe }
      });
      if (oPasse === null) {
        // MESSAGE: user NON trouvé, avec redirection à l'index
        await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
        return res.redirect(urlIndex);
      }
      //
      // retour:
      let dm = oUser.DATE_MODIFICA;
      if(dm === null){ dm = ""; }      
      derniereMAJour = (dm.trim() === "") ? oUser.DATE_CREATION : oUser.DATE_MODIFICA;
      const sDecode = decodageDeThierry(oPasse.passe2);
      unUser = {
        nom: oUser.nom,
        prenom: oUser.prenom,
        pseudo: oUser.pseudo,
        telephone: oUser.telephone,      
        email: oUser.email, 
        passe: sDecode,
        detail: oUser.detail,
        id: oUser.id,
        idpasse: oUser.passe
      }      
    }
    // ---Apres-un-redirect-(erreur de data)--------------------------------------------------------------------------------
    if(tabDesDonnees.length != 0){ 
      // AUTRES PASSAGES: Après redirection en erreur on rechage depuis le body
      const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
      derniereMAJour = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
      unUser = tabDesDonnees[0];
    }
    // OK:    
    const oTemplateData = {
      titre: "Modifier les données USER",
      description: "Demo SQL SEQUELIZE mysql2 avec ejs layout table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      urlActionEdit: urlActionEdit,
      urlActionDelete: urlActionDelete,
      derniereMAJour: derniereMAJour,
      tabDesErreurs: tabDesErreurs,
      tabDesZones: tabDesZones,
      r_user: unUser
    }
    //
    // RENDRE le Formulaire: de MODIFICATION d'un user
    res.status(200).render("user/edit", oTemplateData);
    // ____________________________________________________________________________________________________
  } catch (error) {
    // ERREUR
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - soumettreUpdateFormulaire() - " + 
                    " mise à jour - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";     
    console.log(message);
    await req.flash("infoErreur", message);
    res.redirect(urlIndex);  
  }
};  
/*****************************************/
// PUT  updateOne: User
exports.updateOne = async (req, res) => {
  // METTE A JOUR un utilisateur avec id= id  
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + "/edit/"       // "/demo-user/user/edit/"    // + ID
  const id = req.params.id;
  const body = req.body;
  const {nom, prenom, pseudo, telephone, email, passe, detail, idpasse} = req.body;
  // CONTROLE: 
  // le corps de la demande doit être au format { NOM: 'nom', PRENOM: 'prénom', ... }
  // + cohérence des donnéées (doublons)
  const {tabDesZones, message}  = await validationUpdateUser(body);
  if(message != ""){
    // ERREUR + conservation des zones SAISIE (en modification) par l'utilisateur + redirection
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', {
      nom: nom,
      prenom: prenom,
      pseudo: pseudo,
      telephone: telephone,      
      email: email, 
      passe: passe,
      detail: detail,
      id: id,
      idpasse: idpasse
    });
    return res.redirect(urlActionEdit+id);
  }
  // DATA OK:  
  const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
  const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
  const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
  const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj
  //
  const DATE_UPD = bddDate;        // aaaammjj
  const DATE_MODIFICA = maDate     // jj/mm/aaaa
  const HEURE_MODIFICA = monHeure  // hh:mm:ss
  const USER_UPD = pseudo.substring(1-1, 10);
  try {
    // CRYPTAGE OBLIGATOIRE du mot de passe:
    const oHash = await bcrypt.hash(passe, 8);
    const oHash2 = encodageDeThierry(passe);
    if(oHash === null){
      const message = 'updateUser, ERREUR: dans le cryptage du mot de passe.';
      console.log(message);
      await req.flash("info", message);
      return res.redirect(urlIndex);
    }   
    // CONTROLE: on commence par LIRE le user sur: id, pour vérifier si existe
    const oOption = {
      attributes: {exclude: ['createdAt', 'updatedAt']}
    }    
    const ooUser = await User.findByPk(id, oOption)
    if (ooUser === null) {
      // MESSAGE: user NON trouvé, avec redirection à l'index
      const message = "Le user avec id (" + id + ") n'existe pas!";
      console.log(message);
      await req.flash("info", message);
      return res.redirect(urlIndex);
    }
    //
    //
    // OK: update sans commit (with NONE)
    const unUser = {
      nom: nom,
      prenom: prenom,
      pseudo: pseudo,
      telephone: telephone,
      email: email,
      passe: oHash,
      detail: detail,
      DATE_UPD: DATE_UPD,
      DATE_MODIFICA: DATE_MODIFICA,
      HEURE_MODIFICA: HEURE_MODIFICA,
      USER_UPD: USER_UPD
    }
    const unPasse = {
      passe: oHash,
      passe2: oHash2
    }
    // https://dev.to/coscoaj1/how-to-complete-a-put-request-in-sequelize-c54
    await User.update(
      unUser, 
      { where: {id: id} }
    );    
    await User2.update(
      unPasse, 
      { where: {passe: idpasse} }
    );
    //
    // FAIT: redirection sur index, avec message d'information
    const message = "Le user (" + nom +", " + prenom + ")," +
    " identifié ID=(" + id + ") a bien été modifié.";
    await req.flash("info", message);
    res.redirect(urlIndex);
  } catch (error) {
    // ERREUR
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - updateUser() - " + 
                    " mise à jour - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";     
    console.log(message);
    await req.flash("infoErreur", message);
    res.redirect(urlIndex);
  }
};
// -----------------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------------
// -----------------------------------FORMULAIRE ejs Authentification  + POST --------------------------------
/*****************************************/
// GET  soumettreAuthFormulaire
exports.soumettreAuthFormulaire = async (req, res) => {
  const tabDesErreurs = req.flash('infoErreur');
  const tabDesDonnees = req.flash('infoDonnees');
  const tabDesZones = req.flash('tabDesZonesEnErreur');
  const urlActionAuth = urlprefixe_appli + urlprefixe_user + '/auth'               //  "/demo-user/user/auth" 
  const adrrip = 
   req.headers['cf-connecting-ip'] ||
   req.headers['x-real-ip'] ||
   req.headers['x-forwarded-for'] ||
  req.socket.remoteAddress || '';

  // AFFICHAGE DU FORMULAIRE DE SAISIE d'un USER
  // RENDRE la PAGE: user/auth   --> qui va POSTER '/demo-user/user/auth'
  //
  // CHARGER les zones au cas où: on viens d'un redirect sur  erreur
  let email = '';
  let passe = '';
  const IPADRR = adrrip;
  // AUTRES passages après redirect sur erreur (il faut conserver les données du body)
  if(tabDesDonnees != ''){
    email = tabDesDonnees[0].email;
    passe = tabDesDonnees[0].passe;
  }
  const oConnexionUser = {
    email: email,
    passe: passe,
    IPADRR: IPADRR
  }
  // PAGE
  const oTemplateData = {
    titre: "CONEXXION USER",
    description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
    urlIndex: urlIndex,
    urlabout: urlabout,
    urlRecherche: urlRecherche,
    urlActionAuth: urlActionAuth,
    tabDesErreurs: tabDesErreurs,
    tabDesZones: tabDesZones,
    r_user: oConnexionUser
  }
  //
  // RENDRE le Formulaire: de AUTHENTIFGICATION d'un user
  res.status(200).render("user/auth", oTemplateData);
};  

/*****************************************/
// POST  authUser
exports.authUser = async (req, res) => {
  const {body} = req;
  const {email, passe, IPADRR} = req.body;  
  // CONTROLE: le corps de la demande doit être au format { email: 'email', passe: 'passe' }
  // récupérre les données + valider avec joi
  const {tabDesZones, message} = await validationAuthUser(body);
  if(message != ""){
    // ERREUR + redirection
    await req.flash("infoErreur", message);
    await req.flash("tabDesZonesEnErreur", tabDesZones);
    await req.flash('infoDonnees', { 
      email: email, 
      passe: passe 
    });
    return res.redirect(urlconnexion);
  }
  //
  // DATA OK:
  try {
    // GENERER le token d authentification--------------------------------------------
    require('dotenv').config({path: '../config/.env'})
    // RECHERCHE du user par son email: il existe Obligatoirement car déjà contrôlé avant)
    const oUser = await User.findOne({
      where: { email: email }
    });
    const phraseSecrète = process.env.JWT_SECRET; //'foo'
    const duree = process.env.JWT_DUREE; // 4 hour
    const token = jwt.sign({                       
            id: oUser.id,
            nom: oUser.nom,
            prenom: oUser.prenom,
            pseudo: oUser.pseudo,
            email: oUser.email,      
            phraseSecrète: phraseSecrète,
    }, phraseSecrète, { expiresIn: duree });
    // AJOUTER le token d authentification à: Utilisateur en train de se connecter (moi)
    // this.tabTokens.push({ token })
    // SAUVEGARDER ce token (Objet de connexion )--------------------------------------
    const oConnexion = {
            id: oUser.id,
            nom: oUser.nom,
            prenom: oUser.prenom,            
            token: token                  
    } 
    //
    // SAUVEGARDE: de l'Objet de connexion
    //             - en base de donnees user3
    //             - oconnexion dans les cookies      
    //             - oconnexion dans le fichier user3
    const monTimeStamp = new Date().toLocaleString("fr");       // jj/mm/aaaa hh:mm:ss
    const maDate = monTimeStamp.substring(1-1, 10);             // jj/mm/aaaa
    const monHeure = monTimeStamp.substring(12-1, 19);          // hh:mm:ss
    const bddDate = cvtDate(maDate, "aaaammjj");                // fmt saisie vers aaaammjj  
    //
    const DATE_CON = bddDate;      // aaaammjj
    const DATE_CONNEXION = maDate  // jj/mm/aaaa
    const HEURE_CON = monHeure;    // hhmmss    
    //    
    // CREATION: suivi des users conecté
    const unUser3 = {
      token: oConnexion.token,
      refid: oConnexion.id,
      nom: oConnexion.nom,
      prenom: oConnexion.prenom ,
      DATE_CON: DATE_CON,
      DATE_CONNEXION: DATE_CONNEXION,
      HEURE_CON: HEURE_CON,
      IPADRR: IPADRR
    }
    await User3.create(unUser3);
    //
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 4320000
    res.cookie('jwt', oConnexion.token, { httpOnly: true, maxAge: maxAge });
    res.cookie('oconnexion', oConnexion, { httpOnly: true, maxAge: maxAge });
    //
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + oUser.nom +", " + oUser.prenom + ") a bien été connecté.");
    res.redirect(urlIndex);
  } catch (error) {      
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - authUser() - " + 
                    " authentification - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";                  
    console.log(message);
    await req.flash("infoErreurs", message);
    return res.redirect(urlconnexion);            
  }
};

/*****************************************/
// POST  logout
exports.logoutUser = async (req, res) => {
  // 1: Vérifier la présence du token (dans les cookies / ou header)
  // 2: Décoder le token sous try-catch
  // 3: Vérifier l'utilisateur présent dans le token, il doit être présent en base
  // 4: Supprimer le token dans user3
  // 5: supprimer le token jwt dans les cookies & le oconnexion

  // 1:        
  const authToken = req.cookies.jwt;
  if ((authToken === null) || (authToken === undefined)) {            
      // ERREUR Absence de token
      // ERREUR + redirection
      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  }
  // 2:
  const phraseSecrète = process.env.JWT_SECRET; //'foo'
  let decodeToken = undefined;
  try {
      decodeToken = await jwt.verify(authToken, phraseSecrète);
  } catch (error) {
      // KO
      // ERREUR + redirection
      const message = "ERREUR de deconnexion!";
      res.locals.user = null;
      res.cookie('jwt', '', {maxAge: 1});
      await req.flash("info", message);
      return res.redirect(urlIndex);
  }
  if (decodeToken===undefined) {
      // KO, le client (ejs) est déjà informé de l'ERREUR, voir ci-dessus
      // ERREUR + redirection        
      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  } 
        
  // 3:
  const oUser = await User.findOne({
    where: { id: decodeToken.id }
  });  
  if (oUser === null) {
      // KO
      res.locals.user = null;
      const message = "ERREUR de deconnexion!";
      await req.flash("info", message);        
      return res.redirect(urlIndex);
  }
  //
  const oConnexion = {
      id: oUser.id,
      nom: oUser.nom,
      prenom: oUser.prenom,
      token: authToken                  
  }

  console.log('objet de connexion,  oConnexion=');
  console.log(oConnexion);
  //
  // RECHERCHE et suppression du token
  try {
    const oDelete = await User3.destroy({
      where: {token: oConnexion.token}
    })

    console.log('------------suppression, oDelete');
    console.log(oDelete);    

    // DECONNEXION  = Forcer les deux données dans les cookies à BLANC === Déconnecté
    // * oconnexion = Objet de connexion
    // * jwt        = Token jwt  
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 4320000
    res.cookie('oconnexion', '', { httpOnly: true, maxAge: maxAge });
    res.cookie('jwt', '', { httpOnly: true, maxAge: maxAge });
    //
    //    
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + oUser.nom +", " + oUser.prenom + ") a bien été déconnecté.");
    res.redirect(urlIndex);
    // ___________________________________________________________________________________________
  } catch (error) {
    //
    // ERREUR CATCH: Message console + return brut pour l'instant
    const message = "ERREUR en catch User - (user-controleur.js) - logoutUser() - " + 
                    " logout - " + 
                    " erreur en catch interne au serveur, error =(" + error.message + ").";                  
    console.log(message);
    await req.flash("infoErreur", message);
    return res.redirect(urlconnexion);     
  }
}
// -----------------------------------------------------------------------------------------------------------




// https://github.com/lukmanharun1/person/blob/master/controller/person.js
/*****************************************/
// GET  homepage 
exports.homepage = async (req, res) => {
  // récupération des messages flash ()
  const tabDesMessages = req.flash('info');
  const tabMenuDynamique = [
    {nom: 'lientest1', urlmenu: urlprefixe_appli + urlprefixe_user +'/lientest1'},
    {nom: 'lientest2', urlmenu: urlprefixe_appli + urlprefixe_user +'/lientest2'}
  ];
  // connexion
  const oObjetDeConnexion = req.cookies.oconnexion; // objet de connexion || BLANC
  // url
  const urlSoumettreAddUser = urlprefixe_appli + urlprefixe_user + '/add'     //  "/demo-seq/user/add"
  const urlActionView = urlprefixe_appli + urlprefixe_user       + '/view/'   //  "/demo-seq/user/view/"  // + ID
  const urlActionEdit = urlprefixe_appli + urlprefixe_user       + '/edit/'   //  "/demo-seq/user/Edit/"  // + ID
  const urlActionDelete = urlprefixe_appli + urlprefixe_user     + '/edit/'   //  "/demo-seq/user/Edit/"  // + ID
  // PAGES: 12 lignes par pages
  let perPage = 12;
  let page = req.query.page || 1;

  try {
    // LECTURE des users
    // !!! NE PAS Utiliser: findAndCountAll(oOption) ça renvoie N'importe quoi !!!
                                                        // const where = "";
                                                        // const oOption1 = {    }
                                                        // await User.sync({ force: true });
                                                        // await User2.sync({ force: true });
                                                        // await User3.sync({ force: true });
    // 
    // Option de pagination
    const oOption = {
      attributes: {exclude: ['createdAt', 'updatedAt']},
      offset: perPage * page - perPage,
      limit: perPage
    }
    const tabUsers = await User.findAll(oOption);
    const count = await User.count();
    //
    // connexion
    console.log('homepage, oObjetDeConnexion='+oObjetDeConnexion);
    let urlConn = null;
    let urlDeconn = null;
    let tabMenu = null;
    // if(oObjetDeConnexion === null){ console.log('oObjetDeConnexion est null'); }
    // if(oObjetDeConnexion === undefined){ console.log('oObjetDeConnexion est undefined'); }
    // if(oObjetDeConnexion === ''){ console.log('oObjetDeConnexion est BLANC'); }
    if((oObjetDeConnexion === undefined) || (oObjetDeConnexion === null) || (oObjetDeConnexion === '')){
      // Non connecté:
      urlConn = urlconnexion;
    } else {
      // Connecté:
      urlDeconn = urldeconnexion;
      tabMenu = tabMenuDynamique;
    }
    //
    // RENDRE la PAGE: index.ejs
    const oTemplateData = {
      titre: "Accueil Dashboard",
      description: "Demo SQL SEQUELIZE mysql2 avec ejs layout table users",
      current: page,
      pages: Math.ceil(count / perPage),
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      urlconnexion: urlConn,
      urldeconnexion: urlDeconn,
      urlSoumettreAddUser: urlSoumettreAddUser,
      urlActionView: urlActionView,
      urlActionEdit: urlActionEdit,
      urlActionDelete: urlActionDelete,
      tabDesMessages: tabDesMessages,
      tabMenuDynamique: tabMenu,
      tabUsers: tabUsers
    }
    res.status(200).render("index", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************/
// GET  getOne  : get One Client
exports.getOne = async (req, res) => {
  // AFFICHER un utilisateur avec UID= id
  const id = req.params.id;
  //const id = 123;
  try {
    // LECTURE
    const oOption = {
      attributes: {exclude: ['createdAt', 'updatedAt']}
    }
    const unUser = await User.findByPk(id, oOption)

    // https://sebhastian.com/sequelize-findone/
    // https://sebhastian.com/tags/sequelize/
    // const ooouser = await User.findOne({
    //   where: { id: id },
    // });

    if (unUser === null ) {
      // MESSAGE: user NON trouvé, avec redirection à l'index
      await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
      return res.redirect(urlIndex);
    }
    // OK: AFFICHER le user
    // RENDRE la PAGE: user/view
    let dm = unUser.DATE_MODIFICA;
    if(dm === null){ dm = ""; }
    const derniereMAJour = (dm.trim() === "") ? unUser.DATE_CREATION : unUser.DATE_MODIFICA;
    const oTemplateData = {
      titre: "Afficher les données user",
      description: "Demo SQL AS400 avec ejs layout et idb-pconnector table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
      derniereMAJour: derniereMAJour,
      r_user: unUser
    }
    res.status(200).render("user/view", oTemplateData);
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch User getOne, error=" + error);
    return res.send({message: "User getOne, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }
};




/*****************************************/
// DELETE  deleteOne: Client
exports.deleteOne = async (req, res) => {
  //
  // SUPPRIMER un utilisateur avec UID= id
  // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
  const id = req.params.id;
  try {
    // CONTROLE: on commence par LIRE le user sur: id, pour vérifier si existe
    const unUser = await User.findOne({
      where: { id: id }
    });
    if(unUser === null){
      console.log("User deleteOne, ERREUR: cet user n'existe pas pour cet id.")
      // MESSAGE: user NON trouvé, avec redirection à l'index
      await req.flash("info", "Le user avec id (" + id + ") n'existe pas!!!");
      return res.redirect(urlIndex);
    }
    // OK: suppression
    const oDelete = await User.destroy({
      where: {id: id}
    })


    console.log('------------suppression, oDelete');
    console.log(oDelete);


    //
    // FAIT: redirection sur index, avec message d'information
    await req.flash("info", "Le user (" + unUser.nom +", " + unUser.prenom + ") a bien été supprimé.");
    res.redirect(urlIndex);
  } catch (error) {
    // ERREUR CATCH: Message console + return brut pour l'instant
    console.error("ERREUR catch deleteUser, error=" + error);
    return res.send({message: "deleteUser, ERREUR catch: Erreur interne au serveur, error=", error: error.message});
  }  
};

/*****************************************/
// POST  recherche users
exports.rechercheUsers = async (req, res) => {
};


/*****************************************/
// GET  recherche clients
exports.about = async (req, res) => {
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "About",
      description: "Demo SQL SEQUELIZE mysql2 avec ejs layout table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("about", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************/
// GET  test1
exports.lientest1 = async (req, res) => {
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "test 1",
      description: "Demo SQL SEQUELIZE mysql2 avec ejs layout table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("test1", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************/
// GET  test2
exports.lientest2 = async (req, res) => {
  try {
    //
    // RENDRE la PAGE: about
    const oTemplateData = {
      titre: "test 2",
      description: "Demo SQL SEQUELIZE mysql2 avec ejs layout table users",
      urlIndex: urlIndex,
      urlabout: urlabout,
      urlRecherche: urlRecherche,
    }
    res.status(200).render("test2", oTemplateData);
  } catch (error) {
    console.log(error);
  }
};