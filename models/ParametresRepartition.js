module.exports = (sequelize, DataTypes) => {
  const ParametresRepartition = sequelize.define('ParametresRepartition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    partFixe: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    facteurCogerant: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    partRCP: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    partProjets: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'parametres_repartition',
    timestamps: false
  });

  return ParametresRepartition;
}; 