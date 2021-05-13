const { User, Thought } = require('../models');

const thoughtController = {
    getAllThoughts(req, res) {
        Thought.find({})
            .populate({
                path: 'reactions'
            })
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.thoughtId })
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thought found with this id.'});
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    addThought({ params, body }, res) {
        Thought.create(body)
            .then((dbThoughtData) => {
                User.findOneAndUpdate(
                    { _id: params.userId }, 
                    { $push: { thoughts: dbThoughtData._id } }, 
                    { new: true }
                )
            })
            .then(res.json({ message: 'Thought successfully added!' }))
            .catch(err => res.status(400).json(err));
    },

    addReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true, runValidators: true }
          )
            .then(dbUserData => {
              if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id.' });
                return;
              }
              res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },
    
    removeReaction({ params }, res) {
        Thought.findOneAndUpdate(
          { _id: params.thoughtId },
          { $pull: { reactions: params.reactionId } },
          { new: true }
        )
          .then(dbUserData => res.json(dbUserData))
          .catch(err => res.json(err));
    },

    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.thoughtId }, body, { new: true, runValidators: true})
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id.'});
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.json(err));
    },

    removeThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId })
            .then(deletedThought => {
                if (!deletedThought) {
                    return res.status(404).json({ message: 'No thought found with this id.' });
                }
                return res.json({ message: 'Thought successfully deleted.' });
            })
            .catch(err => res.json(err));
      }
};

module.exports = thoughtController;