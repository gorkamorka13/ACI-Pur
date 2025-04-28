module.exports = (sequelize, DataTypes) => {
  const Projet = sequelize.define('Projet', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => Date.now().toString()
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    annee: {
      type: DataTypes.STRING,
      allowNull: false
    },
    poids: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('en-cours', 'terminé', 'annulé'),
      allowNull: false
    }
  }, {
    tableName: 'projets',
    timestamps: false
  });

  return Projet;
}; 