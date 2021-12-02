
const express = require('express');
const app = express();
const fs = require('fs')
const port = process.env.PORT || 3000;
const www = process.env.WWW || './';

const stripe = require('stripe')(process.env.SK);

app.set('view-engine', 'ejs');
app.use(express.static(www));
app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
    fs.readFile('./products.json', (err, data)=> {
        if(err) res.status(400).end();
        
        res.render(`index.ejs`, {
            data: JSON.parse(data)
        });
    })
});

app.get('/about', (req, res) => {
    res.render(`about.ejs`);
});

app.get('/cart', (req, res) => {
    res.render(`cart.ejs`, {
        PK: process.env.PK
    });
});

app.get('/success', (req, res)=> {
    res.send(`<h1>Payment Successful</h1>`)
})

app.get('/cancel', (req, res)=> {
    res.send(`<h1>Payment Failed</h1>`)
})


app.post('/create-checkout-session', async (req, res)=> {
    try {
        console.log('POST::::::Checkout')
        const products = await getProductList();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: 'payment', // if subscription use subscription
            line_items: req.body.items.map(p => {
                let item = products.filter(a => {
                    if(a.id == p) return a
                })
                item = item[0];

                
                return {
                    price_data: {
                        currency: 'inr', // it could be variable
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.price // in paise
                    },
                    quantity: 1
                }
            }),
            success_url: `${process.env.SERVER_URL}/success`,
            cancel_url: `${process.env.SERVER_URL}/cancel`
        })

        res.json({
            url: session.url
        })
    }catch(err) {}
    
    // res.json({
    //     url: 'hi'
    // })
})


function getProductList() {
    return new Promise((resolve, reject)=> {

        fs.readFile('./products.json', (err, data)=> {
            if(err) res.status(400).end();
            
            let result = JSON.parse(data)

            resolve(result.products)
            
        })
    })
}

console.log(`serving ${www}`);
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
