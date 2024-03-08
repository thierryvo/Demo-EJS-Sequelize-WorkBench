// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/models/users3.js                  user3  stoke les users en cours de connexion...
// ==========================================================================================================
// import des modules nécessaires
const sequelize = require('sequelize')
const db = require('./database.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CREER un nouveau Schéma: user3 ( Nom du modèle (nom de la table créée):  user3 )
// oOptions: Objet d'options qui définie la table à CREER dans la base de données
// modèle (UserSchema)--------------------------------------------------------------------------------------
// clé unique: id
const {DataTypes} = sequelize
const nomDuModele = 'user3'
const oOptions = {
    token: {
        type: DataTypes.STRING(500),
        primaryKey: true,
        allowNull: false 
    },
    refid : {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},    
    nom: {type: DataTypes.STRING(60), allowNull: false },
    prenom: {type: DataTypes.STRING(60), allowNull: false },
    DATE_CON: {type: DataTypes.STRING(8), allowNull: true},
    DATE_CONNEXION: {type: DataTypes.STRING(10), allowNull: true},
    HEURE_CON: {type: DataTypes.STRING(8), allowNull: true},
    IPADRR: {type: DataTypes.STRING(60), allowNull: true}
}
//
// ____________________________________________________________________________________________________________________
const User3 = db.define(nomDuModele, oOptions)
//
// Export:
module.exports = User3;
