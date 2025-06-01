const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// Enhanced home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home | Simple Kitchen',
    showForm: false,
    success: req.query.success // Add success message if redirected from registration
  });
});

// Improved registration page route
router.get('/register', (req, res) => {
  res.render('index', { 
    title: 'Register | Simple Kitchen',
    showForm: true,
    data: {}, // Initialize empty data object
    errors: null // Initialize errors as null
  });
});

// Protected registrations list
router.get('/registrations', basic.check(async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.render('registrants', { 
      title: 'Listing registrations', 
      registrations 
    });
  } catch (err) {
    console.error('Registration fetch error:', err);
    res.status(500).render('error', { 
      message: 'Sorry! Something went wrong.' 
    });
  }
}));

// Enhanced form submission handler
router.post('/register', 
  [
    check('name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    check('email')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please enter an email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('index', { 
        title: 'Register | Simple Kitchen',
        showForm: true,
        errors: errors.array(),
        data: req.body
      });
    }

    try {
      // Check for existing email
      const existingRegistration = await Registration.findOne({ email: req.body.email });
      if (existingRegistration) {
        return res.render('index', {
          title: 'Register | Simple Kitchen',
          showForm: true,
          errors: [{ msg: 'This email is already registered' }],
          data: req.body
        });
      }

      // Create new registration
      const registration = new Registration({
        name: req.body.name,
        email: req.body.email
      });

      await registration.save();
      
      // Redirect to home with success message
      res.redirect('/?success=true');
      
      // Alternatively, render thank you page directly:
      // res.render('thankyou', { 
      //   title: 'Thank You',
      //   name: req.body.name 
      // });
      
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).render('index', {
        title: 'Register | Simple Kitchen',
        showForm: true,
        errors: [{ msg: 'Server error occurred. Please try again.' }],
        data: req.body
      });
    }
  }
);

module.exports = router;