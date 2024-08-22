const express = require('express');
const router = express.Router()
var fetchuser = require("../middleware/fetchuser");
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator');


// ROUTE:1 GET ALL THE NOTES USING : get  "/api/notes/fetchallnotes"  LOGIN  REQUIRED
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
    }


})

// ROUTE:2 ADD A NEW NOTE USING  : post  "/api/notes/addnote"  LOGIN  REQUIRED
router.post('/addnote', fetchuser,
    [body('title', 'Enter a Valid Title').isLength({ min: 3 }),
    body('description', 'Description atleast 5 letter').isLength({ min: 5 })
    ], async (req, res) => {
        try {
            const { title, description, tag } = req.body
            // IF THERE ARE ERROR OCCURED , RETURN THE BAD REQUEST
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNotes = await note.save()
            res.json(savedNotes)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error")
        }
    })

// ROUTE:3 UPDATE AN EXISTING NOTE USING  : post  "/api/notes/updatenote"  LOGIN  REQUIRED
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // create a new note object
        const newNote = {}
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // find the note to be updated and update it
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
    }
})

// ROUTE:4 Delete NOTE USING  : delete  "/api/notes/deletenote"  LOGIN  REQUIRED
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {// find the note to be deleted and delete it
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") }


        // ALLOW DELETION ONLY IF USER OWNS THIS  NOTES
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note Has Been Deleted", note: note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error")
    }
})

module.exports = router