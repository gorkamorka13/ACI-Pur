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
    tableName: 'projets',
    timestamps: false
  });

  Projet.associate = (models) => {
    // Association for Responsables (Managers/Leaders)
    Projet.belongsToMany(models.Professionnel, {
      through: 'ProjetResponsables', // Name of the join table
      as: 'Responsables',           // Alias to access associated professionals as responsables
      foreignKey: 'projetId',       // Foreign key in the join table pointing to Projet
      otherKey: 'professionnelId'   // Foreign key in the join table pointing to Professionnel
    });

    // Association for Contributeurs (Contributors)
    Projet.belongsToMany(models.Professionnel, {
      through: 'ProjetContributeurs', // Name of the join table
      as: 'Contributeurs',          // Alias to access associated professionals as contributeurs
      foreignKey: 'projetId',       // Foreign key in the join table pointing to Projet
      otherKey: 'professionnelId'   // Foreign key in the join table pointing to Professionnel
    });
  };

  return Projet;
};
