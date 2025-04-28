module.exports = (sequelize, DataTypes) => {
  const RcpMeeting = sequelize.define('RcpMeeting', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => Date.now().toString()
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duree: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'rcp_meetings',
    timestamps: false
  });

  return RcpMeeting;
}; 