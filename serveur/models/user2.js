// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/models/users.js
// ==========================================================================================================
// import des modules nécessaires
const sequelize = require('sequelize')
const db = require('./database.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CREER un nouveau Schéma: user    ( Nom du modèle (nom de la table créée):  user )
// oOptions: Objet d'options qui définie la table à CREER dans la base de données
// modèle (UserSchema)--------------------------------------------------------------------------------------
// clé unique: id
const {DataTypes} = sequelize
const nomDuModele = 'user2'
const oOptions = {
    passe: {
        type: DataTypes.STRING(250), 
        primaryKey: true,
        allowNull: false
    },
    passe2: {type: DataTypes.STRING(60), allowNull: false }
}
//
// ____________________________________________________________________________________________________________________
const User2 = db.define(nomDuModele, oOptions)
//
// Export:
module.exports = User2;
