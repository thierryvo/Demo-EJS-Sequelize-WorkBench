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
const nomDuModele = 'user'
const oOptions = {
    id : {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nom: {type: DataTypes.STRING(60), allowNull: false },
    prenom: {type: DataTypes.STRING(60), allowNull: false },
    pseudo: {type: DataTypes.STRING(60), allowNull: false },
    telephone: {type: DataTypes.STRING(15), allowNull: true},
    email: {type: DataTypes.STRING(60), allowNull: false },
    passe: {type: DataTypes.STRING(250), allowNull: false },    
    detail: {type: DataTypes.STRING(200), allowNull: true},
    age: {type: DataTypes.INTEGER, allowNull: true},
    salaire: {type: DataTypes.FLOAT, allowNull: true},
    DATE_CRT: {type: DataTypes.STRING(8), allowNull: true},
    DATE_CREATION: {type: DataTypes.STRING(10), allowNull: true},
    DATE_UPD: {type: DataTypes.STRING(8), allowNull: true},
    DATE_MODIFICA: {type: DataTypes.STRING(10), allowNull: true},
    HEURE_MODIFICA: {type: DataTypes.STRING(8), allowNull: true},
    USER_CRT: {type: DataTypes.STRING(60), allowNull: true},
    USER_UPD: {type: DataTypes.STRING(60), allowNull: true}
    
}
//
// ____________________________________________________________________________________________________________________
const User = db.define(nomDuModele, oOptions)
//
// Export:
module.exports = User;
