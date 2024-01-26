const mongoose = require('mongoose');
const Product = require('./models/product');

const products = [
    {
        name:"iphone 15pro",
        img:'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 140000,
        desc: "Good phone"
    },
    {
        name:"macbook m2",
        img:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 250000,
        desc: "Good laptop but expensive"
    },
    {
        name:"iwatch",
        img:'https://images.unsplash.com/photo-1539114658890-4222fe247c05?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 70000,
        desc: "good watch"
    },
    {
        name:"ipad",
        img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 88000,
        desc: "best laptop ever"
    },
    {
        name:"airpods",
        img:'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 27000,
        desc: "Too expensive"
    }
]

async function seedDB(){
    // await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("data seeded successfully")
}

module.exports = seedDB;