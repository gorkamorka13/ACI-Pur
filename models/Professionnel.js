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
    tableName: 'professionnels',
    timestamps: false
  });

  Professionnel.associate = (models) => {
    // Define the many-to-many relationship with RcpMeeting
    Professionnel.belongsToMany(models.RcpMeeting, {
      through: 'meeting_attendees', // Must match the join table name in RcpMeeting model
      foreignKey: 'professionnelId',  // Foreign key in the join table for Professionnel
      otherKey: 'meetingId',      // Foreign key in the join table for RcpMeeting
      as: 'Meetings'              // Alias for the association (optional, but good practice)
    });
  };

  return Professionnel;
};
