import jwt from 'jsonwebtoken';

const generateToken = (userId, email, res) => {
  try {
    const token = jwt.sign({ email, userId }, process.env.JWT_SECRET, {
      expiresIn: '1800s',
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1 * 1000,
      sameSite: 'None',
      // sameSite: 'strict',
      // secure: false, // Include this if your app is served over HTTP
      secure: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export { generateToken };
