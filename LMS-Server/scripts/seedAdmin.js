require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');

const USER_DB = process.env.USER_DB;
const USERPASS = process.env.USERPASS;
const MONGO_URI = `mongodb+srv://${USER_DB}:${USERPASS}@cluster0.rdbtijm.mongodb.net/TeachingManager?retryWrites=true&w=majority`;

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@lms.com';
        const password = 'admin123';

        let user = await User.findOne({ email });
        if (user) {
            console.log('User with admin email already exists.');
            user.passwordHash = password;
            await user.save();
            console.log('Password reset for existing user.');

            let profile = await Profile.findOne({ user: user._id });
            if (!profile) {
                console.log('User exists but no profile. Creating admin profile...');
                await Profile.create({
                    user: user._id,
                    fullName: 'System Admin',
                    role: 'admin',
                    bankBalance: 1000000
                });
            } else if (profile.role !== 'admin') {
                console.log('Updating existing profile to admin role...');
                profile.role = 'admin';
                if (profile.bankBalance < 1000000) profile.bankBalance = 1000000;
                await profile.save();
            }
        } else {
            console.log('Creating new Admin User...');
            user = new User({
                email,
                passwordHash: password
            });
            await user.save();

            await Profile.create({
                user: user._id,
                fullName: 'System Admin',
                role: 'admin',
                bankBalance: 1000000
            });
        }

        console.log('-------------------------------------------');
        console.log('Admin Account Ready');
        console.log('Email: admin@lms.com');
        console.log('Password: admin123');
        console.log('-------------------------------------------');

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
