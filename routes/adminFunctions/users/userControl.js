import { getDb } from '../../../plugins/mongo/mongo.js';
import { ObjectId } from 'mongodb';

export const getUserEditor = async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('users');
    const obId = req.query.id;
    const userId = new ObjectId(obId);
    console.log(obId);

    const user = await collection.findOne({ _id: userId });
    res.render('userEditor', { user: user });
  } catch (error) {
    res.send(`error: ${error}`);
  }
};

export const postUserEdit = async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('users');

    const userId = req.body._id; // Assuming you're passing the user ID via a hidden input field in the form
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          address: address,
        },
      }
    );

    res.redirect('/admin'); // Redirect to admin page after successful edit
  } catch (error) {
    res.send(`Error: ${error}`);
  }
};
