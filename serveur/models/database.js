// ==========================================================================================================
// DEMO-SEQ  (CRUD avec EJS layout & SEQUELIZE mysql2) NodeJS Express                   http://localhost:3000
// ==========================================================================================================
// dossier: C:\WORK\NODEJS\DEMO-SEQ
// fichier: serveur/models/database.js                                                                                             
// ==========================================================================================================
// import des modules nécessaires
const Sequelize = require('sequelize')

// Instanciation de Sequelize, avec quelques informations:  mysql ou mysql2 ?
const baseDeDonnees = process.env.BDD_NOM  // 'crud'
const nomUtilisteur = process.env.BDD_USER // 'root'
const motDePasse   = process.env.BDD_PASSE // 'root'
// host: 'localhost'    port: '3307'
const oOptions = {
    dialect: 'mysql',
    host: process.env.BDD_HOST,
    port: process.env.BDD_PORT
}
// export default new Sequelize(baseDeDonnees, nomUtilisteur, motDePasse, oOptions)
//
// Export:
module.exports = new Sequelize(baseDeDonnees, nomUtilisteur, motDePasse, oOptions);