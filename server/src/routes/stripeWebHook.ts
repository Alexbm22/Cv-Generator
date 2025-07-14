import { Request, Response, NextFunction } from "express";
import { stripe } from '../app';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    let event = req.body;
    
    if(endpointSecret){
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (error) {
            console.log(`⚠️  Webhook signature verification failed.`, error);
            res.sendStatus(400);
        }
    }

    console.log(event.data.object.metadata);

    res.json({received: true});
}

// {
//   id: 'evt_3RjfkoGqAOA0KN3g1gW2S4UY',
//   object: 'event',
//   api_version: '2025-06-30.basil',
//   created: 1752235753,
//   data: {
//     object: {
//       id: 'ch_3RjfkoGqAOA0KN3g1zaJsOHF',
//       object: 'charge',
//       amount: 600,
//       amount_captured: 600,
//       amount_refunded: 0,
//       application: null,
//       application_fee: null,
//       application_fee_amount: null,
//       balance_transaction: null,
//       billing_details: [Object],
//       calculated_statement_descriptor: 'Stripe',
//       captured: true,
//       created: 1752235753,
//       currency: 'eur',
//       customer: null,
//       description: null,
//       destination: null,
//       dispute: null,
//       disputed: false,
//       failure_balance_transaction: null,
//       failure_code: null,
//       failure_message: null,
//       fraud_details: {},
//       livemode: false,
//       metadata: [Object],
//       on_behalf_of: null,
//       order: null,
//       outcome: [Object],
//       paid: true,
//       payment_intent: 'pi_3RjfkoGqAOA0KN3g1QxaD3x6',
//       payment_method: 'pm_1RjflMGqAOA0KN3gHlcL4qtk',
//       payment_method_details: [Object],
//       radar_options: {},
//       receipt_email: null,
//       receipt_number: null,
//       receipt_url: 'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xUmllYTdHcUFPQTBLTjNnKOn9w8MGMgaWwmkYk046LBZ9yMhyl5XR7T34hQViIOrp26ZJqUYx-DcLU6JSxfNo4TDqL7neGA_Z-hoh',
//       refunded: false,
//       review: null,
//       shipping: null,
//       source: null,
//       source_transfer: null,
//       statement_descriptor: null,
//       statement_descriptor_suffix: null,
//       status: 'succeeded',
//       transfer_data: null,
//       transfer_group: null
//     }
//   },
//   livemode: false,
//   pending_webhooks: 2,
//   request: {
//     id: 'req_FOFvISXiK03gtm',
//     idempotency_key: '8322a25e-8dc6-4a8c-817d-0b49ab09212f'
//   },
//   type: 'charge.succeeded'
// }r
