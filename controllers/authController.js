const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, age, gender, job, educationQualification, 
      zodiacSign, religion, hobbies, about, family, area, state, pin, interests
    } = req.body;

    // Validate hobbies (must be exactly 5)
    let hobbyArray = JSON.parse(hobbies || "[]");
    if (!Array.isArray(hobbyArray) || hobbyArray.length !== 5) {
      return res.status(400).json({ message: "You must provide exactly 5 hobbies" });
    }

    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Construct Address
    const address = { area, state, pin };

    // Parse Interests Array
    console.log(interests);
    
    let interestArray = JSON.parse(interests || "[]");

    console.log(interestArray);
    
    

    // Construct Image Path with Full HTTP URL
    // const serverUrl = "http://192.168.137.1:5000"; // Replace with your actual server IP & port
    const imagePath = req.file ? `/assets/${email}/${req.file.filename}` : "";

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      age,
      gender,
      address,
      job,
      educationQualification,
      zodiacSign,
      religion,
      hobbies: hobbyArray,
      about,
      family,
      interests: interestArray,
      image: `${imagePath}`
    });

    // Save user
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user:{
      name:user.name,
      email:user.email,
      age:user.age,
      gender:user.gender,
      address:user.address,
      job:user.job,
      educationQualification:user.educationQualification,
      zodiacSign:user.zodiacSign,
      religion:user.religion,
      hobbies: user.hobbyArray,
      about:user.about,
      family:user.family,
      interests: user.interestArray,
      image: `${"http://localhost:5000"}${user.image}`
    } });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile (Protected Route)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Users Based on Interests
// exports.getFilteredUsers = async (req, res) => {
//   try {
//     const loggedInUser = await User.findById(req.user.userId);
//     if (!loggedInUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const { interests } = loggedInUser;

//     // If no interests are set, return all users except the logged-in one
//     if (!interests || interests.length === 0) {
//       const users = await User.find({ _id: { $ne: req.user.userId } }).select("-password");
//       return res.status(200).json(users);
//     }

//     // Construct query based on user's interests
//     // const filters = interests.map((interest) => ({
//     //   age: { $gte: interest.ageRange.min, $lte: interest.ageRange.max },
//     //   religion: interest.religion,
//     //   _id: { $ne: req.user.userId } // Exclude logged-in user
//     // }));

//     const matchedUsers = await User.find({ $or: filters }).select("-password");

//    let allImagesValue= matchedUsers.map((val)=>{
//       return ({image:val.image=`http://192.168.1.143:5000${val.image}`})
//     })

//     console.log(allImagesValue);

//     for (let i=0;i<matchedUsers.length;i++){
//       for(let j=0;j<allImagesValue.length;j++){
//         if(i==j){
//           Object.assign(matchedUsers[i],allImagesValue[j])
//         }
//       }
//     }
    
//     res.status(200).json(matchedUsers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getFilteredUsers = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.userId);
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { interests } = loggedInUser;

    // If no interests, return all users except the logged-in one
    if (!interests || interests.length === 0) {
      const users = await User.find({ _id: { $ne: req.user.userId } }).select("-password");
      return res.status(200).json(users);
    }

    // Find users that share at least one interest
    const matchedUsers = await User.find({
      _id: { $ne: req.user.userId }, // Exclude logged-in user
      interests: { $in: interests }  // At least one interest should match
    }).select("-password");

    // Attach full image URL
    const matchedWithImageURLs = matchedUsers.map(user => {
      return {
        ...user._doc,
        image: user.image ? `http://localhost:5000${user.image}` : ""
      };
    });

    res.status(200).json(matchedWithImageURLs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAdvancedFilteredUsers = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    const { gender, job, educationQualification, zodiacSign, minAge, maxAge, area, state, pin, hobbies, interests } = req.body;

    let filterQuery = { _id: { $ne: req.user.userId } };

    if (gender) filterQuery.gender = gender;
    if (job) filterQuery.job = job;
    if (educationQualification) filterQuery.educationQualification = educationQualification;
    if (zodiacSign) filterQuery.zodiacSign = zodiacSign;
    if (area) filterQuery["address.area"] = area;
    if (state) filterQuery["address.state"] = state;
    if (pin) filterQuery["address.pin"] = pin;

    if (hobbies && Array.isArray(hobbies) && hobbies.length > 0) {
      filterQuery.hobbies = { $in: hobbies };
    }

    if (interests && Array.isArray(interests)) {
      let interestReligions = interests.map(i => i.religion);
      filterQuery["interests.religion"] = { $in: interestReligions };
    }

    if (minAge || maxAge) {
      filterQuery.age = {};
      if (minAge) filterQuery.age.$gte = parseInt(minAge);
      if (maxAge) filterQuery.age.$lte = parseInt(maxAge);
    }

    console.log("MongoDB Query:", JSON.stringify(filterQuery, null, 2));

    const filteredUsers = await User.find(filterQuery).select("-password").lean();

    console.log("Filtered Users:", filteredUsers);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

