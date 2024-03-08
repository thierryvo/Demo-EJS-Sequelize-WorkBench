// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/validations/user-validations.js   
// ==========================================================================================================
// import des modules nécessaires
const User = require("../models/user");
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bcrypt = require('bcryptjs');
//
//
/*****************************************/
// validation: Auth User
exports.validationAuthUser = async function (theBody) {
    let tabDesZones = ['N','N'];
    // 1:
    // CONTROLE: le corps de la demande doit être au format: { email: 'email', passe: 'passe' }
    if (!theBody.hasOwnProperty('email') ||
        !theBody.hasOwnProperty('passe')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." +
                            " Passer dans le body: email, passe";
            return {tabDesZones, message};
    }
    //
    // controle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // email
    longueur = theBody.email.trim().length;
    if(longueur < min ){
        const message = "Votre email est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre email est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    // passe
    max = 20;
    longueur = theBody.passe.trim().length;
    if(longueur < min ){
        const message = "Votre passe est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre passe est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }
    if (!isPasseValide(theBody.passe.trim())){
        const message = "Votre passe est invalide, il contien un caractère d'échappement \\ ou ^."
        tabDesZones[1]='O';                                                
        return {tabDesZones, message};
    }    
    //
    // try catch acces fichier
    try {        
        // 2: 
        // retrouver le user en base de données (par son email unique) 
        // ==> pour savoir si mot de passe est correct
        const oUser = await User.findOne({
            where: { email: theBody.email }
        });
        if(oUser === null){
            const message = "cet user n'existe pas pour cet email ("+theBody.email+")."   
            tabDesZones[0]='O';             
            return {tabDesZones, message};
        }
        // 3:        
        // CONTROLE des mots de passe, ils doivent être identique
        const mdpRecu = theBody.passe;
        const mdpBasededonnee = oUser.passe
        const resultat = await bcrypt.compare(mdpRecu, mdpBasededonnee);
        if(resultat === false){            
            const message = "cet user n'existe pas pour cet email/passe ("+theBody.email+" / "+theBody.passe+")."    
            tabDesZones[1]='O';            
            return {tabDesZones, message};
        }
        //
        //
        // OK: retour d'un message vide
        console.log('---Dedans la validation (OK)  --- controle  ok');
        const message = "";
        return {tabDesZones, message};
    } catch (error) {
        //
        const message2 = "ERREUR en catch User - (user-validation.js) validationAuthUser() - " + 
        " authentification - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ").";   
        console.log(message2);
        
        const message = "erreur catch, cet user n'existe pas pour cet email/passe ("+theBody.email+" / "+theBody.passe+").";
        return {tabDesZones, message};  
    }
}
//
//
/*****************************************/
// validation: Add USer
exports.validationAddUser = async function (theBody) {
    let tabDesZones = ['N','N','N','N','N','N','N'];
    // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
    // CONTROLE: le corps de la demande doit être au format:
    //           { NOM: 'nom', PRENOM: 'prénom', PSEUDO: 'pseudo', TELEPHONE: 'telephone', EMAIL: 'email', PASSE: 'passe', DETAIL: 'detail'  }
    if (!theBody.hasOwnProperty('nom') || 
        !theBody.hasOwnProperty('prenom') ||
        !theBody.hasOwnProperty('pseudo') ||
        !theBody.hasOwnProperty('telephone') ||
        !theBody.hasOwnProperty('email') ||
        !theBody.hasOwnProperty('passe') ||
        !theBody.hasOwnProperty('detail')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." + 
                            " Passer dans le body: nom, prenom, pseudo, telephone, email, passe, detail";
            return {tabDesZones, message};
    }
    //
    // contrôle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // nom
    longueur = theBody.nom.trim().length;
    if(longueur < min ){
        const message = "Votre nom est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre nom est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    //
    // prenom
    longueur = theBody.prenom.trim().length;
    if(longueur < min ){
        const message = "Votre prenom est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre prenom est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    //
    // pseudo
    longueur = theBody.pseudo.trim().length;
    if(longueur < min ){
        const message = "Votre pseudo est trop court, taille minimum (" + min + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre pseudo est trop long, taille maximum (" + max + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    //
    // téléphone   
    max = 15;    
    longueur = theBody.telephone.trim().length;
    if(longueur < min ){
        const message = "Votre telephone est trop court, taille minimum (" + min + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre telephone est trop long, taille maximum (" + max + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }            
    //
    // email
    max = 60; 
    longueur = theBody.email.trim().length;
    if(longueur < min ){
        const message = "Votre email est trop court, taille minimum (" + min + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre email est trop long, taille maximum (" + max + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    //
    // passe
    max = 20; 
    longueur = theBody.passe.trim().length;
    if(longueur < min ){
        const message = "Votre passe est trop court, taille minimum (" + min + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre passe est trop long, taille maximum (" + max + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    //
    // détail   
    max = 200;
    longueur = theBody.detail.trim().length;
    if(longueur < min ){
        const message = "Votre detail est trop court, taille minimum (" + min + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre detail est trop long, taille maximum (" + max + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }    
    //    
    // AUTRES CONTROLES BASE DE DONNES ET COHERANCES BDD
    // =================================================
    // try catch accès fichiers (tables)
    try {                
        // Cohérence email: l'email doit être unique, il faut rechercher si cette email n'Existe pas déjà
        // si Existe c'est une erreur        
        const oUser = await User.findOne({
            where: { email: theBody.email }
        });
        if (oUser != null) {
            // MESSAGE: 
            const message = "GENERATION d'une Clé en double, cet email (" + theBody.email + 
                            ") existe déjà pour un autre user avec id (" + oUser.id + ").";            
            tabDesZones[4]='O';             
            return {tabDesZones, message}; 
        }
        //                
        // Cohérence pseudo: le pseudo doit être unique, il faut rechercher si ce pseudo n'Existe pas déjà
        // si Existe c'est une erreur 
        const oUser2 = await User.findOne({
            where: { pseudo: theBody.pseudo }
        });                 
        if (oUser2 != null) {        
            // MESSAGE: 
            const message = "GENERATION d'une Clé en double, ce pseudo (" + theBody.pseudo + 
                            ") existe déjà pour un autre user avec id (" + oUser2.id + ").";
            tabDesZones[2]='O';             
            return {tabDesZones, message};             

        }
        //
        // OK: pas d'erreur
        // retour d'un message vide + tabDesZones (en erreur) à N
        const message = "";
        return {tabDesZones, message};                  
    } catch (error) {
        // MESSAGE catch:                        
        const message = "ERREUR en catch User - (user-validation.js) validationAddUser() - " + 
        " ajout - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ")."                                                   
        return {tabDesZones, message};          
    }
    
}

/*****************************************/
// validation: Update User
exports.validationUpdateUser = async function (theBody) {
    let tabDesZones = ['N','N','N','N','N','N','N'];
    // https://testdemogitbook.gitbook.io/restify/new-tutorial-2-rest-apis-and-the-ibm-i
    // CONTROLE: le corps de la demande doit être au format:
    //           { NOM: 'nom', PRENOM: 'prénom', PSEUDO: 'pseudo', TELEPHONE: 'telephone', EMAIL: 'email', PASSE: 'passe', DETAIL: 'detail'  }
    if (!theBody.hasOwnProperty('nom') || 
        !theBody.hasOwnProperty('prenom') ||
        !theBody.hasOwnProperty('pseudo') ||
        !theBody.hasOwnProperty('telephone') ||
        !theBody.hasOwnProperty('email') ||
        !theBody.hasOwnProperty('passe') ||
        !theBody.hasOwnProperty('detail')) {
            // ERREUR: il manque des zones dans le body
            const message = "Votre demande n'a pas été formatée correctement." + 
                            " Passer dans le body: nom, prenom, pseudo, telephone, email, passe, detail";
            return {tabDesZones, message};
    }
    //
    // contrôle des tailles
    const min = 3;
    let max = 60;
    let longueur = 0;
    //
    // nom
    longueur = theBody.nom.trim().length;
    if(longueur < min ){
        const message = "Votre nom est trop court, taille minimum (" + min + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre nom est trop long, taille maximum (" + max + ")."
        tabDesZones[0]='O';
        return {tabDesZones, message};
    }
    //
    // prenom
    longueur = theBody.prenom.trim().length;
    if(longueur < min ){
        const message = "Votre prenom est trop court, taille minimum (" + min + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre prenom est trop long, taille maximum (" + max + ")."
        tabDesZones[1]='O';
        return {tabDesZones, message};
    }
    //
    // pseudo
    longueur = theBody.pseudo.trim().length;
    if(longueur < min ){
        const message = "Votre pseudo est trop court, taille minimum (" + min + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre pseudo est trop long, taille maximum (" + max + ")."
        tabDesZones[2]='O';
        return {tabDesZones, message};
    }
    //
    // téléphone   
    max = 15;    
    longueur = theBody.telephone.trim().length;
    if(longueur < min ){
        const message = "Votre telephone est trop court, taille minimum (" + min + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre telephone est trop long, taille maximum (" + max + ")."
        tabDesZones[3]='O';
        return {tabDesZones, message};
    }            
    //
    // email
    max = 60; 
    longueur = theBody.email.trim().length;
    if(longueur < min ){
        const message = "Votre email est trop court, taille minimum (" + min + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre email est trop long, taille maximum (" + max + ")."
        tabDesZones[4]='O';
        return {tabDesZones, message};
    }
    //
    // passe
    max = 20; 
    longueur = theBody.passe.trim().length;
    if(longueur < min ){
        const message = "Votre passe est trop court, taille minimum (" + min + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre passe est trop long, taille maximum (" + max + ")."
        tabDesZones[5]='O';
        return {tabDesZones, message};
    }
    //
    // détail   
    max = 200;
    longueur = theBody.detail.trim().length;
    if(longueur < min ){
        const message = "Votre detail est trop court, taille minimum (" + min + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }
    if(longueur > max ){
        const message = "Votre detail est trop long, taille maximum (" + max + ")."
        tabDesZones[6]='O';
        return {tabDesZones, message};
    }    
    //    
    // AUTRES CONTROLES BASE DE DONNES ET COHERANCES BDD
    // =================================================
    // try catch accès fichiers (tables) 
    // https://sebhastian.com/sequelize-where/
    // https://doc.esdoc.org/github.com/sequelize/sequelize/manual/querying.html
    try {
        // Cohérence email: la modification email ne doit pas tomber sur l'email d'un autre id déjà existant
        // si Existe c'est une erreur
        //         const Op = Sequelize.Op;
        const oUser = await User.findOne({
            where: { 
                email: theBody.email,
                id: { [Op.ne]:theBody.id }
            }
        });
        if(oUser != null){
            // SI email trouvé sur un autre id alors: c'est une erreur
            if(oUser.email === theBody.email & oUser.id != theBody.id){
                // KO
                // MESSAGE: 
                const message = "Cohérence de Clé, cet email (" + theBody.email +
                                ") existe déjà pour un autre user différent avec id (" + oUser.id + ").";                        
                tabDesZones[4]='O';             
                return {tabDesZones, message};                  

            }
        }
        //                
        // Cohérence pseudo: la modification pseudo ne doit pas tomber sur le pseudo d'un autre id déjà existant
        // si Existe c'est une erreur
        const oUser2 = await User.findOne({
            where: { 
                pseudo: theBody.pseudo,
                id: { [Op.ne]:theBody.id }
            }
        });
        if(oUser2 != null){            
            // SI pseudo trouvé sur un autre id alors: c'est une erreur  
            if(oUser2.pseudo === theBody.pseudo & oUser2.id != theBody.id){
                // KO
                // MESSAGE: 
                const message = "Cohérence de Clé, ce pseudo (" + theBody.pseudo +
                                ") existe déjà pour un autre user différent avec id (" + oUser2.id + ").";
                tabDesZones[2]='O';                            
                return {tabDesZones, message};                  
            }
        }
        //
        // OK: pas d'erreur
        // retour d'un message vide + tabDesZones (en erreur) à N
        const message = "";
        return {tabDesZones, message};
        // ______________________________________________________________________________________                          
    } catch (error) {
        // MESSAGE catch:                        
        const message = "ERREUR en catch User - (user-validation.js) validationUpdateUser() - " + 
        " modification - " + 
        " erreur en catch interne au serveur, error =(" + error.message + ")."                                                   
        return {tabDesZones, message};                     
    }    
}

/*****************************************/
// validation: formatage Data Update USer
exports.formatageDataUpdateUser = function (unUser) {
    // OK:
    // TAILLE DES ZONES:
    // =================
    let max = 0;
    let longueur = 0;
    let tabMsgVar = [];
    //

    longueur = unUser.nom.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.nom = unUser.nom.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable NOM trop long - NOM a été tronqué à '+max);        
    }

    longueur = unUser.prenom.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.prenom = unUser.prenom.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PRENOM trop long - PRENOM a été tronqué à '+max);
    }

    longueur = unUser.pseudo.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.pseudo = unUser.pseudo.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PSEUDO trop long - PSEUDO a été tronqué à '+max);
    }    

    longueur = unUser.email.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.email = unUser.email.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable EMAIL trop long - EMAIL a été tronqué à '+max);
    }      

    longueur = unUser.passe.trim().length;
    max = 60;
    if(longueur>max){ 
        unUser.passe = unUser.passe.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable PASSE trop long - PASSE a été tronqué à '+max);
    }     

    longueur = unUser.telephone.trim().length;
    max = 15;
    if(longueur>max){ 
        unUser.telephone = unUser.telephone.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable TELEPHONE trop long - TELEPHONE a été tronqué à '+max);
    }      

    longueur = unUser.detail.trim().length;
    max = 200;
    if(longueur>max){ 
        unUser.detail = unUser.detail.substring(1-1, max); 
        tabMsgVar.push('contenu de la variable DETAIL trop long - DETAIL a été tronqué à '+max);
    }

    //
    // RETOUR:
    return tabMsgVar;
}

// ==================================== local ====================================
// ==============================================
// isPasseValide: Rejet de certains caractères
// ==============================================
isPasseValide = function (win) {
    const tabCarIn = win.split('');
    //
    // BOUCLE sur chaque caratères: tabCarIn
    let longueur = win.length
    for(let pas = 0; pas < longueur; pas++ ){
        // 
        // test caractère par caractère
        if(tabCarIn[pas] === '\\'){ return false; } // Rejet du caractère d'échapement '\'
        if(tabCarIn[pas] === '^'){ return false; }  // Rejet du chapeau chinois sans ça lettre ('ê'  est autorisé )
        //
        // suivant
    }
    // RETOUR: OK    
    return true;
}
// ====================================
// isAnneeValide: 00 à 99
// ====================================
isAnneeValide = function (annee) {
    if ( (annee>=0) && (annee<=99) ) {
        return true;
    } else {
        return false;
    }
}
