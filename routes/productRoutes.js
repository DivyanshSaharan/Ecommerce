const express =  require('express');
// const Joi = require('joi');
const Product = require('../models/product');
const router = express.Router();
const {validateProduct , isLoggedIn, isSeller, isProductAuthor} =  require('../middleware');
const Review = require('../models/review');
const stripe = require('stripe')('sk_test_51OcmQxSFDu1ZCDJRMHu4qcnsgSSJDHOb5rwkq0ZGXzLbVSJNsQkAv8pGYXeBJFSQtJUetLtm8s1SrodzbhqGXqj300O8m1nMoW');

// displaying all the products
router.get('/products' , async(req,res)=>{
    try{
        let products = await Product.find({});
        res.render('products/index' , {products});
    }
    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
    
})


// adding a fomr for  anew product
router.get('/products/new' , isLoggedIn ,isSeller , (req,res)=>{
    try{
        res.render('products/new');
    }
    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
})

// actually adding a product in a DB 
router.post('/products' ,isLoggedIn , isSeller ,  validateProduct , async (req,res)=>{
    try{
        let {name,img,price,desc} = req.body;

        await Product.create({name,img,price,desc , author:req.user._id});
        req.flash('success' , 'Product added successfully');
        res.redirect('/products');
    }
    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
})

// route for shwoing the deatails of thre products
router.get('/products/:id' , isLoggedIn , async(req,res)=>{
    try{

        let {id} = req.params;
        // let foundProduct = await Product.findById(id);
        let foundProduct = await Product.findById(id).populate('reviews');
        // console.log(foundProduct);
        res.render('products/show' , {foundProduct , msg:req.flash('msg')});
    }

    catch(e){
        res.status(500).render('error' , {err:e.message});
    }

})

// route for editing the product so we need form for it
router.get('/products/:id/edit' , isLoggedIn , isSeller ,isProductAuthor, async(req,res)=>{
    try{

        let {id} = req.params;
        let foundProduct = await Product.findById(id);
        res.render('products/edit' , {foundProduct});
        
    }
    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
})

//Direct buying the Product
router.get('/products/:id/buy' , async(req,res)=>{
    // let userId = req.params.id;
    // let user = await User.findById(userId).populate("cart");
    // let totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
    // let cart=[...user.cart]
    // let g=cart.map((items)=>{
    //   return items;
    // })
    //   console.log(totalAmount);
    let {id} = req.params;
    let foundProduct = await Product.findById(id);
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: foundProduct.name,
              },
              unit_amount: foundProduct.price*100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
      success_url: `http://${req.headers.host}/success`,
      cancel_url: `http://${req.headers.host}/ProductCancel/${id}`,
    });
    res.redirect(303, session.url);
});

router.get('/ProductCancel/:id', isLoggedIn,async(req, res) => {
    // req.flash("info", "Payment Failed");
    let {id} = req.params;
    res.redirect(`/products/${id}`);
});

// changing the original edits in the database made in the editform 
router.patch('/products/:id',isLoggedIn , isSeller, isProductAuthor, validateProduct, async(req,res)=>{
    try{

        let {id} = req.params;
        let {name,img,price,desc} = req.body;
        await Product.findByIdAndUpdate(id , {name,img,price,desc});
        req.flash('success' , 'Product edited successfully');
        res.redirect(`/products/${id}`)
    }

    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
})

//delete a route
router.delete('/products/:id' , isLoggedIn, isSeller , isProductAuthor , async(req,res)=>{
    try{

        let {id} = req.params;
        const product = await Product.findById(id);
        
        for(let id of product.reviews){
            await Review.findByIdAndDelete(id);
        }
        
        await Product.findByIdAndDelete(id);
        req.flash('success' , 'Product deleted successfully');
        res.redirect('/products');
    }

    catch(e){
        res.status(500).render('error' , {err:e.message});
    }
})



module.exports = router;