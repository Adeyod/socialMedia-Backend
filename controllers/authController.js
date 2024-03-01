import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Token from '../models/tokenModel.js';
import { verifyEmail } from '../utils/nodemailer.js';
import { generateToken } from '../utils/jwtAuth.js';

const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (forbiddenCharsRegex.test(trimmedUsername)) {
      return res.json({
        message: 'Invalid character in username',
        status: 400,
        success: false,
      });
    }

    if (forbiddenCharsRegex.test(trimmedFirstName)) {
      return res.json({
        message: 'Invalid character in first name',
        status: 400,
        success: false,
      });
    }

    if (forbiddenCharsRegex.test(trimmedLastName)) {
      return res.json({
        message: 'Invalid character in last name',
        status: 400,
        success: false,
      });
    }

    // check the email field to prevent input of unwanted characters
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 400,
        success: false,
      });
    }

    // // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    // check whether user already exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.json({
        message: 'User already exist',
        status: 400,
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashPassword,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    }).save();

    const token =
      crypto.randomBytes(32).toString('hex') +
      crypto.randomBytes(32).toString('hex');

    const newToken = await new Token({
      token,
      userId: newUser._id,
    }).save();

    const link = `${process.env.FRONTEND_URL}/?user-verification&userId=${newToken.userId}&token=${newToken.token}`;

    await verifyEmail(link, newUser.email);

    return res.json({
      message: 'Email verification link sent to your email',
      status: 200,
      success: true,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: true,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: 'Invalid credentials',
        status: 400,
        success: false,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({
        message: 'Invalid credentials',
        status: 400,
        success: false,
      });
    }

    if (user.isVerified === false) {
      // check valid token
      const validToken = await Token.findOne({ userId: user._id });
      if (validToken) {
        const link = `${process.env.FRONTEND_URL}/?user-verification&userId=${validToken.userId}&token=${validToken.token}`;

        await verifyEmail(link, user.email);

        return res.json({
          message: 'Check your email to verify your email',
          success: false,
        });
      } else {
        const token =
          crypto.randomBytes(32).toString('hex') +
          crypto.randomBytes(32).toString('hex');

        const newToken = await new Token({
          token,
          userId: user._id,
        }).save();

        const link = `${process.env.FRONTEND_URL}/?user-verification&userId=${newToken.userId}&token=${newToken.token}`;

        await verifyEmail(link, user.email);

        return res.json({
          message: 'Email verification link sent to your email address',
          success: true,
        });
      }
    }

    const { password: hashedPassword, ...others } = user._doc;
    const generatedToken = await generateToken(user.email, user._id, res);

    return res.json({
      message: 'Login successful',
      status: 200,
      success: true,
      user: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

// Login user
const verifyUser = async (req, res) => {
  try {
    const { userId, token } = req.query;

    const tokenExist = await Token.findOne({
      token,
      userId,
    });

    if (!tokenExist) {
      return res.json({
        message: 'Token does not exist',
        status: 404,
        success: false,
      });
    }

    const userUpdate = await User.findByIdAndUpdate(
      {
        _id: tokenExist.userId,
      },
      {
        $set: { isVerified: true },
      },
      { new: true }
    );

    if (!userUpdate) {
      return res.json({
        message: 'Unable to verify user',
        status: 400,
        success: false,
      });
    }

    const { password: hashedPassword, ...others } = userUpdate._doc;
    return res.json({
      message: 'User updated successfully',
      status: 200,
      success: true,
      user: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

export { registerUser, loginUser, verifyUser };
