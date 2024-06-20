const mongoose = require('mongoose');
const User = require('./User'); // Adjust the path as necessary

mongoose.connect("mongodb+srv://divyanshsaharan2:dskisite159753@divyansh.jt7xmy5.mongodb.net/EcommerceWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected');
    migrateCartSchema();
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
  
  async function migrateCartSchema() {
    try {
      const users = await User.find({ 'cart.0': { $exists: true } });
  
      for (const user of users) {
        let updatedCart = user.cart.map(item => {
          if (typeof item === 'object' && item !== null) {
            return { product: item._id || item.product, quantity: item.quantity || 1 };
          }
          return { product: item, quantity: 1 };
        });
  
        user.cart = updatedCart;
        await user.save();
      }
  
      console.log('Migration completed');
    } catch (error) {
      console.error('Migration failed', error);
    } finally {
      mongoose.disconnect();
    }
  }