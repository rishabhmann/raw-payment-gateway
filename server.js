const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const crypto = require("crypto");
const Razorpay = require("razorpay");


let keySecret = "Xxs0spHqnHO1k8oQxIQPCCIv";
var razorpay = new Razorpay({
    key_id: "rzp_test_pyfv9Bn50M1z3A",
    key_secret: "Xxs0spHqnHO1k8oQxIQPCCIv"
});



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));


// home page

app.get("/", (req, res) => {
    res.render("index"); // redirecting to simple donate button page
});

app.post("/", (req, res) => {
    res.redirect("/donate"); // redirecting to donate get page
})

// donate page
// this page was made to collect amount and orderID

app.get("/donate", function (req, res) {
    res.sendFile(__dirname + "/donate.html");


});

app.post("/donate", function (req, res) {

    let email = req.body.emailType;
    let phone = req.body.phoneType;
    let name = req.body.nameType;
    let amount = req.body.amountType * 100;

    var options = {
        amount: amount, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };

    razorpay.orders.create(options, function (err, order) {

        amount = order.amount;
        orderID = order.id;

        // now after taking values , redirecting to checkout page
        res.redirect("/checkout");

        app.get("/checkout", (request, response) => {

            response.render("checkout", {
                nameType: name,
                emailType: email,
                phoneType: phone,
                amountType: amount,
                orderID: orderID
            });
        });

        app.post("/checkout", (request, response) => {
            response.render("checkout", {
                nameType: name,
                emailType: email,
                phoneType: phone,
                amountType: amount,
                orderID: orderID
            });

            // app.get("/api/payment/verify", (request1, response1) => {
            //     
            // });

            // app.post("/api/payment/verify", (request1, response1) => {
                    
            body = request.body.razorpay_order_id + "|" + request.body.razorpay_payment_id;

            var expectedSignature = crypto.createHmac('sha256', keySecret)
            // expe.update(body.toString())
            //     .digest('hex');
            // console.log("sig" + request.body.razorpay_signature);
            // console.log("sig" + expectedSignature);
            // var answer = {
            //     "status": "failure"
            // }
            // if (expectedSignature === request.body.razorpay_signature)
            //     answer = {
            //         "status": "success"
            //     }
            // response.send(answer);
            // // });
            expectedSignature.update(JSON.stringify(req.body))
            const digest = expectedSignature.digest("hex")
            if(digest === req.headers["x-razorpay-signature"]) {
                res.json({
                    status: "ok"
                })
            
            } else
                res.status(400).send("invalid");

        })


    });

});




app.listen(3000, function () {
    console.log("Listening on port 3000")
});