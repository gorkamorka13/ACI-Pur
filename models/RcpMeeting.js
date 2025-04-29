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
    tableName: 'rcp_meetings',
    timestamps: false
  });

  RcpMeeting.associate = (models) => {
    // Define the many-to-many relationship with Professionnel
    RcpMeeting.belongsToMany(models.Professionnel, {
      through: 'meeting_attendees', // Name of the join table
      foreignKey: 'meetingId',      // Foreign key in the join table for RcpMeeting
      otherKey: 'professionnelId',  // Foreign key in the join table for Professionnel
      as: 'Professionnels'          // Alias for the association (used in meeting.setProfessionnels)
    });
  };

  return RcpMeeting;
};
