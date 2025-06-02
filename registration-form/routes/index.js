const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');

// ... (basic auth setup remains the same)

// GET: Home page (with form)
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Simple Kitchen',
    showForm: true,
    errors: null,
    data: {}
  });
});

// POST: Handle form submission
router.post('/register',
  [
    check('name')
      .trim()
      .notEmpty().withMessage('Name is required'),
    check('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Enter a valid email')
      .normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('index', {
        title: 'Registration Error',
        showForm: true,
        errors: errors.array(),
        data: req.body
      });
    }

    try {
      const existing = await Registration.findOne({ email: req.body.email });
      if (existing) {
        return res.render('index', {
          title: 'Registration Error',
          showForm: true,
          errors: [{ msg: 'This email is already registered' }],
          data: req.body
        });
      }

      const registration = new Registration({
        name: req.body.name,
        email: req.body.email
      });

      await registration.save();
      res.redirect('/thankyou'); // Redirect to thank you page on success

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).render('index', {
        title: 'Registration Error',
        showForm: true,
        errors: [{ msg: 'Server error occurred. Please try again.' }],
        data: req.body
      });
    }
  }
);

// GET: Thank you page
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { 
    title: 'Thank You' 
  });
});

// ... (other routes remain the same)

module.exports = router;