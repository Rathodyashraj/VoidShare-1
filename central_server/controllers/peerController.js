const User = require('../models/User');

exports.getAllOnlineUsers = async (req, res) => {
    try {
       
        const onlineUsers = {usernames:["krish","sahil"]};

    //need to implement the logic to get all online users

        res.json(onlineUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve online users' });
    }
};

exports.sendPeerRequest = async (req, res) => {
    try {
        const { id } = req.params;  // Peer user ID
        const peerUser = await User.findById(id);

        if (!peerUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        //need to implement the logic to check if the peer user is online
        // if (!peerUser.isOnline) {
        //     return res.status(400).json({ error: 'User is not online' });
        // }

        // need to handle the logic to send peer request
        res.json({ message: `Peer request sent to ${peerUser.name}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send peer request' });
    }
};
