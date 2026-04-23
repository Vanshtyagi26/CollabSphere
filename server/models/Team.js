import mongoose from 'mongoose';

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        inviteCode: {
            type: String,
            unique: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: {
                    type: String,
                    default: 'member',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
