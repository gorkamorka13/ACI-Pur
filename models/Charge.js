module.exports = (sequelize, DataTypes) => {
  const Charge = sequelize.define('Charge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categorie: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Fixe', 'Variable'),
      allowNull: false
    },
    montant: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'charges',
    timestamps: false
  });

  return Charge;
}; 