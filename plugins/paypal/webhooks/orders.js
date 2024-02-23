const express = require('express');
const router = express.Router();
const {initiatePaypalOrder,updatePaypalOrder} = require('../dbFunctions')


const checkouts = async (req, res) => {
    console.log('CHECKOUTSFUNCTION')
    try {
        const eventType = req.body.event_type;
        const orderId = req.body.id; // Order ID is common for all events

        console.log(`Received event: ${eventType}, Order ID: ${orderId}`); // Initial log for debugging

        if (eventType == "CHECKOUT.ORDER.COMPLETED") {
            console.log(`Fire finalization`);
            // Asynchronous finalization logic, if any, should be awaited
            // await finalizeOrder(orderId); // Example

            const payerEmail = req.body.resource.payer.email_address;
            const payerId = req.body.resource.payer.payer_id;
            console.log(`Email: ${payerEmail}, ID: ${payerId}, Order ID: ${orderId}`);

            const purchaseUnits = req.body.resource.purchase_units;
            if (purchaseUnits) {
                purchaseUnits.forEach((unit, index) => {
                    console.log(`Purchase Unit ${index + 1}:`);
                    console.log(`Description: ${unit.description}`);
                    console.log(`Amount: ${unit.amount.value} ${unit.amount.currency_code}`);
                    // Additional logging for more fields...
                });
            }
        } else if (eventType == "CHECKOUT.ORDER.APPROVED") {
            const purchaseUnits = req.body.resource.purchase_units;
            let shippingAddress = null;
        
            const status = req.body.resource.status;
            const payerId = req.body.resource.payer.payer_id;
            const payerEmail = req.body.resource.payer.email_address;
            console.log(`Event received: OrderId: ${orderId}, EventType: ${eventType}, Status: ${status}`);
            console.log(`Payer ID: ${payerId}, Payer Email: ${payerEmail}`);
       let customId;
       let description;
       let amount;
            if (purchaseUnits) {
                purchaseUnits.forEach((unit, index) => {
                     customId = unit.custom_id;
                     description = unit.description;
       
                     amount = unit.amount.value;
                    console.log(`Purchase Unit ${index + 1}: Custom ID: ${customId}`);
                    console.log(`Description: ${unit.description}`);
                    console.log(`Amount: ${unit.amount.value} ${unit.amount.currency_code}`);
                    
                    if (unit.items) {
                        unit.items.forEach((item, itemIndex) => {
                            console.log(`  Item ${itemIndex + 1}:`);
                            console.log(`    Name: ${item.name}`);
                            console.log(`    Quantity: ${item.quantity}`);
                            console.log(`    Unit Price: ${item.unit_amount.value} ${item.unit_amount.currency_code}`);
                        });
                    }
                    
                    if (unit.shipping) {
                        console.log('shipping!!!')
                        const shipping = unit.shipping.address;
                        shippingAddress = {
                            addressLine1: shipping.address_line_1 || "",
                            addressLine2: shipping.address_line_2 || "", // Add this if available
                            city: shipping.admin_area_2 || "",
                            state: shipping.admin_area_1 || "",
                            postalCode: shipping.postal_code || "",
                            countryCode: shipping.country_code || ""
                        };
                        console.log(`Shipping Address: ${JSON.stringify(shippingAddress)}`);
                    }
                });
            }
            // Update PayPal order status or other post-processing
            // Ensure this function is asynchronous and awaited
// Example usage
let updateFields = {
    "paypalCompleted": "true",
    "description":description,
    "amount":amount,
    "paypalId":orderId,
    "shippingAddress": shippingAddress
    // Ensure other fields are properly defined and not null
};

// Make sure customId is not null
if (customId) {
    await updatePaypalOrder(customId, updateFields);
} else {
    console.error("customId is null or undefined");
}

        } else {
            const summary = req.body.summary;
            console.log(`Other hooks: ${eventType}, Summary: ${summary}, Order ID: ${orderId}`);
        }

        res.status(200).send('Event received');
    } catch (error) {
        console.error('Error processing the webhook event:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = checkouts;
