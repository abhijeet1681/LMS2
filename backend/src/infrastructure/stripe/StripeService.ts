import Stripe from "stripe";
import { config } from "../config/config";
import { IPaymentService } from "../../application/repositories/IPaymentService";

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null;

if (config.stripe.STRIPE_SECRET_KEY) {
    stripe = new Stripe(config.stripe.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });
} else {
    console.warn('Stripe API key not found. Payment functionality will be disabled.');
}

export class StripeService implements IPaymentService{
 async createCheckOutSession (orderId: string, courses: any[], userId: string, uniqueOrderId:string) : Promise<string> {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    const lineItems = courses.map((course)=> ({
        price_data :  {
            currency: 'inr',
            product_data:{
                name: course.courseTitle || 'Course title',
                description: course.courseDescription || 'A premium course',
                images : [course.courseImage]
            },
            unit_amount: course.coursePrice * 100,
        },
        quantity: 1
    }))

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items : lineItems,
        mode: 'payment',
        success_url: `${config.cors.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderId=${uniqueOrderId}`,
        cancel_url: `${config.cors.CLIENT_URL}/cancel`,
            metadata: {
                orderId, 
                userId,
                courses: JSON.stringify(courses.map((course) => ({
                    title: course.courseTitle,
                    image: course.courseImage,
                    price: course.coursePrice,
                    courseId: course.courseId
                }))),
            },
            payment_intent_data: {
                metadata: {
                    orderId,
                    userId,
                    courses: JSON.stringify(courses.map((course) => ({
                        title: course.courseTitle,
                        image: course.courseImage,
                        price: course.coursePrice,
                        courseId: course.courseId
                    }))),
                },
            },
    })
    return session.id!;
 }

 async retrieveSession (sessionId: string) : Promise<any> {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Retrieved checkout session:", session);

    if (session.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
        );
        console.log("PaymentIntent metadata:", paymentIntent.metadata);

        // Combine metadata if needed
        session.metadata = { ...session.metadata, ...paymentIntent.metadata };
    }
    return session;
 }

}