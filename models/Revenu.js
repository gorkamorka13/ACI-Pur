module.exports = (sequelize, DataTypes) => {
  const Revenu = sequelize.define('Revenu', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => Date.now().toString()
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    montant: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'revenus',
    timestamps: false
  });

  return Revenu;
}; 