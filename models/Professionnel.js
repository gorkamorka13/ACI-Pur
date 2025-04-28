module.exports = (sequelize, DataTypes) => {
  const Professionnel = sequelize.define('Professionnel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Nom'
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Profession'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'Email'
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'Téléphone'
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Statut'
    }
  }, {
    tableName: 'professionnels',
    timestamps: false
  });

  return Professionnel;
}; 