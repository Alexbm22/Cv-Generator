import { stripe } from '../app';
import Stripe from 'stripe';
import { StripeProduct } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { stripeMappers } from '@/mappers';
import User from '@/models/user';
import { ServerUserAttributes } from '@/interfaces/user';
import { userRepository } from '@/repositories';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { SubscriptionService } from './subscriptions';

export class StripeService {
    // Secondary operation: must never throw, so a Stripe outage cannot block user creation.
    static async createCustomerForUser(user: User): Promise<string | null> {
        try {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: String(user.id),
                    publicId: user.public_id
                }
            });

            return customer.id;
        } catch (error) {
            console.error(`Failed to create Stripe customer for user ${user.id}:`, error);
            return null;
        }
    }

    static async getStripeProducts(): Promise<StripeProduct[]> {
        const StripePrices = await stripe.prices.list({ active: true, expand: [`data.product`] });
        const products = stripeMappers.mapStripeToProductModel(StripePrices.data)
        if(!products.length) {
            throw new AppError(
                'No products found from Stripe price list.',
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

        return products;
    }

    static async getPriceById(priceId: string) {
        const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });

        if (!price) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        return price;
    }

    static async getPriceByLookupKey(priceLookupKey: string) {
        const price = await stripe.prices.list({
            lookup_keys: [priceLookupKey],
            active: true,
            expand: ['data.product']
        });

        if (!price.data.length) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        return price.data[0];
    }

    // Creates a SetupIntent for payment method collection (not subscription).
    // Client confirms payment method on-session via stripe.confirmSetupIntent.
    // After confirmation, client calls confirmSetupAndSubscribe endpoint to attach PM and create subscription.
    @handleServiceError("Failed to create subscription checkout.")
    static async createSubscriptionCheckout(
        priceLookupKey: string,
        user: ServerUserAttributes
    ): Promise<string> {
        const price = await this.getPriceByLookupKey(priceLookupKey);

        if (!price) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        if (price.type !== 'recurring') {
            throw new AppError(
                'The selected price must be recurring to create a subscription.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        if ((!price.active) || price.deleted) {
            throw new AppError(
                'The selected price is either inactive or has been deleted.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            customerId = await this.createCustomerForUser(user as User);
            if (customerId) {
                await userRepository.updateUserByFields({ stripeCustomerId: customerId }, { id: user.id });
            }
        }

        if (!customerId) {
            throw new AppError(
                'Unable to create a Stripe customer for this user.',
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

        // Create SetupIntent for payment method collection (no subscription yet)
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            usage: 'off_session',
            metadata: {
                userId: user.id,
                priceLookupKey: priceLookupKey
            }
        });

        if (!setupIntent.client_secret) {
            throw new AppError(
                'Failed to create SetupIntent.',
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }

        return setupIntent.client_secret;
    }

    static async createSubscription(
        customerId: string,
        priceId: string,
    ) {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });
        return subscription;
    }

    // Phase 1 runs for `phase1Days` on `priceId`, then Stripe automatically switches
    // the subscription to `secondPhasePriceId` for phase 2.
    static async createSubscriptionSchedule(
        customerId: string,
        priceId: string,
        secondPhasePriceId: string,
        phase1Days: number
    ) {
        const phase1EndDate = Math.floor(Date.now() / 1000) + phase1Days * 24 * 60 * 60;

        const schedule = await stripe.subscriptionSchedules.create({
            customer: customerId,
            start_date: 'now',
            end_behavior: 'release',
            default_settings: {
                billing_cycle_anchor: 'phase_start',
                collection_method: 'charge_automatically'
            },
            phases: [
                {
                    items: [{ price: priceId, quantity: 1 }],
                    end_date: phase1EndDate,
                    proration_behavior: 'none' 
                },
                {
                    items: [{ price: secondPhasePriceId, quantity: 1 }],
                }
            ]
        });

        return schedule;
    }

    static async createPaymentIntent(
        priceLookupKey: string, 
        user: ServerUserAttributes,
        quantity?: number
    ): Promise<string | null> {
        const price = await this.getPriceByLookupKey(priceLookupKey);

        if(!price) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        // Validate price type and quantity
        if(
            (price.type === 'one_time' && !quantity) ||
            (price.type === 'recurring')
        ) {
            throw new AppError(
                'Invalid request: Invalid price type or missing quantity for one-time payment.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        if((!price.active) || price.deleted) {
            throw new AppError(
                'The selected price is either inactive or has been deleted.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            customerId = await this.createCustomerForUser(user as User);
            if (customerId) {
                await userRepository.updateUserByFields({ stripeCustomerId: customerId }, { id: user.id });
            }
        }

        if (!customerId) {
            throw new AppError(
                'Unable to create a Stripe customer for this user.',
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

        // Reuse an existing unfinished intent for the same price/quantity instead of creating a duplicate on every checkout page load.
        const existingIntents = await stripe.paymentIntents.list({ customer: customerId, limit: 10 });
        const expectedQuantity = quantity ? String(quantity) : '';
        const reusableIntent = existingIntents.data.find(intent =>
            intent.metadata.priceId === price.id &&
            (intent.metadata.quantity ?? '') === expectedQuantity &&
            ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(intent.status)
        );

        if (reusableIntent) {
            return reusableIntent.client_secret;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount!,
            currency: price.currency,
            payment_method_types: ['card'],
            customer: customerId,
            metadata: {
                userId: user.id,
                priceId: price.id,
                quantity: quantity || null
            }
        });

        return paymentIntent.client_secret;
    }

    // Confirms a SetupIntent and retrieves the associated PaymentMethod.
    @handleServiceError("Failed to confirm SetupIntent.")
    static async confirmSetupIntentAndGetPaymentMethod(setupIntentId: string): Promise<Stripe.PaymentMethod> {
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

        if (!setupIntent) {
            throw new AppError(
                'SetupIntent not found.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        if (setupIntent.status !== 'succeeded') {
            throw new AppError(
                `SetupIntent has not succeeded. Current status: ${setupIntent.status}`,
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        if (!setupIntent.payment_method) {
            throw new AppError(
                'No payment method found on SetupIntent.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const paymentMethod = await stripe.paymentMethods.retrieve(setupIntent.payment_method as string);
        return paymentMethod;
    }

    // Attaches a PaymentMethod to a customer and sets it as the default for invoices.
    @handleServiceError("Failed to attach payment method to customer.")
    static async attachPaymentMethodToCustomer(
        customerId: string,
        paymentMethodId: string
    ): Promise<void> {
        // Attach payment method to customer (idempotent via Stripe)
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId
        });

        // Set as the default payment method for invoices
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId
            }
        });
    }

    private static async finalizeAndPayLatestSubscriptionInvoice(subscriptionId: string): Promise<void> {
        const latestInvoices = await stripe.invoices.list({
            subscription: subscriptionId,
            limit: 1,
        });

        const latestInvoice = latestInvoices.data[0];
        const latestInvoiceId = latestInvoice?.id;
        if (!latestInvoiceId) {
            return;
        }

        let invoice = latestInvoice;

        if (invoice.status === 'draft') {
            invoice = await stripe.invoices.finalizeInvoice(latestInvoiceId);
        }

        if (invoice.status === 'open') {
            invoice = await stripe.invoices.pay(invoice.id ?? latestInvoiceId, {
                off_session: true,
            });
        }

        if (invoice.status !== 'paid') {
            throw new AppError(
                `Invoice ${invoice.id} was not paid immediately. Current status: ${invoice.status}.`,
                400,
                ErrorTypes.BAD_REQUEST
            );
        }
    }

    // Creates a subscription using an already-attached PaymentMethod.
    // Supports both regular subscriptions and trial-based subscription schedules.
    @handleServiceError("Failed to create subscription with payment method.")
    static async createSubscriptionWithPaymentMethod(
        customerId: string,
        paymentMethodId: string,
        priceLookupKey: string
    ): Promise<string> {
        const price = await this.getPriceByLookupKey(priceLookupKey);

        if (!price) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        if (price.type !== 'recurring') {
            throw new AppError(
                'The selected price must be recurring.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        if (!price.active || price.deleted) {
            throw new AppError(
                'The selected price is either inactive or has been deleted.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const priceMetadata = price.metadata as Record<string, string>;
        const isScheduledSubscription = Number(priceMetadata.trial_days) > 0 && priceMetadata.next_phase_price_id;

        if (isScheduledSubscription) {
            // Trial subscription: create 2-phase schedule with the payment method
            const phase1Days = priceMetadata.trial_days;
            const secondPhasePriceId = priceMetadata.next_phase_price_id;

            const phase1EndDate = Math.floor(Date.now() / 1000) + Number(phase1Days) * 24 * 60 * 60;

            const schedule = await stripe.subscriptionSchedules.create({
                customer: customerId,
                start_date: 'now',
                end_behavior: 'release',
                default_settings: {
                    billing_cycle_anchor: 'phase_start',
                    collection_method: 'charge_automatically'
                },
                phases: [
                    {
                        items: [{ price: price.id, quantity: 1 }],
                        end_date: phase1EndDate,
                        proration_behavior: 'none'
                    },
                    {
                        items: [{ price: secondPhasePriceId, quantity: 1 }]
                    }
                ]
            });

            const subscriptionId = typeof schedule.subscription === 'string'
                ? schedule.subscription
                : schedule.subscription?.id;

            if (subscriptionId) {
                await this.finalizeAndPayLatestSubscriptionInvoice(subscriptionId);
            }

            return schedule.id;
        } else {
            // Non-trial subscription: create with default_incomplete, use the attached payment method
            // charge_automatically will charge using the customer's default payment method
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: price.id }],
                default_payment_method: paymentMethodId,
                payment_behavior: 'error_if_incomplete',
                collection_method: 'charge_automatically',
                payment_settings: {
                    save_default_payment_method: 'on_subscription'
                },
                expand: ['latest_invoice.payment_intent']
            });

            await this.finalizeAndPayLatestSubscriptionInvoice(subscription.id);

            return subscription.id;
        }
    }

    @handleServiceError('Failed to cancel subscription')
    static async cancelCurrentSubscription(user: ServerUserAttributes): Promise<{ status: string }> {
        const subscription = await SubscriptionService.getEntitledSubscription(user.id);
        
        const stripeSubscriptionId = subscription?.get("stripe_subscription_id");
        const stripeScheduleId = subscription?.get("stripe_schedule_id");

        if (!subscription || !stripeSubscriptionId) {
            throw new AppError(
                'No active subscription found to cancel.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }


        if (subscription.hasCancellationRequested()) {
            return { status: 'already_canceled' };
        }

        const updatedSubscription = stripeScheduleId
            ? await this.cancelScheduledSubscriptionAtPeriodEnd(
                stripeScheduleId,
                stripeSubscriptionId
            )
            : await stripe.subscriptions.update(stripeSubscriptionId, {
                cancel_at_period_end: true,
            });

        await SubscriptionService.syncSubscriptionFromStripe(updatedSubscription, user.id);

        return { status: 'cancellation_requested' };
    }

    @handleServiceError('Failed to resume subscription')
    static async resumeCurrentSubscription(user: ServerUserAttributes): Promise<{ status: string }> {
        const subscription = await SubscriptionService.getEntitledSubscription(user.id);

        const stripeSubscriptionId = subscription?.get("stripe_subscription_id");
        const stripeScheduleId = subscription?.get("stripe_schedule_id");

        if (!subscription || !stripeSubscriptionId) {
            throw new AppError(
                'No active subscription found to resume.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        if (!subscription.hasCancellationRequested()) {
            return { status: 'already_active' };
        }

        const updatedSubscription = stripeScheduleId
            ? await this.resumeScheduledSubscription(
                stripeScheduleId,
                stripeSubscriptionId
            )
            : await stripe.subscriptions.update(stripeSubscriptionId, {
                cancel_at_period_end: false,
            });

        await SubscriptionService.syncSubscriptionFromStripe(updatedSubscription, user.id);

        return { status: 'resumed' };
    }

    // Converts a retrieved schedule phase back into update-params shape (price expanded -> id).
    // `openEnded` omits `end_date` so the phase keeps auto-renewing indefinitely, matching how
    // the final phase is originally created in createSubscriptionWithPaymentMethod (no end_date).
    private static toScheduleUpdatePhase(
        phase: Stripe.SubscriptionSchedule.Phase,
        options: { openEnded?: boolean } = {}
    ): Stripe.SubscriptionScheduleUpdateParams.Phase {
        const apiPhase: Stripe.SubscriptionScheduleUpdateParams.Phase = {
            items: phase.items.map(item => ({
                price: typeof item.price === 'string' ? item.price : item.price.id,
                quantity: item.quantity ?? 1,
            })),
            start_date: phase.start_date,
            proration_behavior: phase.proration_behavior,
        };

        if (!options.openEnded) {
            apiPhase.end_date = phase.end_date;
        }

        return apiPhase;
    }

    // Schedule-managed subscriptions can't be canceled via subscriptions.update (Stripe rejects it).
    // Instead, truncate the schedule so the current phase is the last one and mark it to cancel once
    // that phase's (already-paid) period ends, preserving access until then. Any future phase(s) are
    // stashed in the schedule's metadata so resumeScheduledSubscription can restore them exactly.
    private static async cancelScheduledSubscriptionAtPeriodEnd(
        scheduleId: string,
        subscriptionId: string
    ): Promise<Stripe.Subscription> {
        const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);

        if (schedule.end_behavior === 'cancel') {
            // Already truncated to cancel at period end; nothing to do.
            return await stripe.subscriptions.retrieve(subscriptionId);
        }

        if (schedule.status !== 'active' || !schedule.current_phase) {
            throw new AppError(
                `Subscription schedule ${scheduleId} has no active phase to cancel.`,
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const currentPhaseIndex = schedule.phases.findIndex(
            phase => phase.start_date === schedule.current_phase!.start_date
        );

        if (currentPhaseIndex === -1) {
            throw new AppError(
                `Could not resolve the current phase for schedule ${scheduleId}.`,
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }

        const keptPhases = schedule.phases.slice(0, currentPhaseIndex + 1);
        const futurePhases = schedule.phases.slice(currentPhaseIndex + 1);

        const apiKeptPhases = keptPhases.map(phase => this.toScheduleUpdatePhase(phase));
        const apiFuturePhases = futurePhases.map((phase, index) =>
            // The last phase of the original schedule is always the open-ended, auto-renewing one.
            this.toScheduleUpdatePhase(phase, { openEnded: index === futurePhases.length - 1 })
        );

        await stripe.subscriptionSchedules.update(scheduleId, {
            end_behavior: 'cancel',
            phases: apiKeptPhases,
            metadata: {
                ...(schedule.metadata ?? {}),
                cvgen_pending_phases: apiFuturePhases.length ? JSON.stringify(apiFuturePhases) : '',
                cvgen_reopen_last_phase: apiFuturePhases.length === 0 ? 'true' : '',
            },
        });

        return await stripe.subscriptions.retrieve(subscriptionId);
    }

    // Reverses cancelScheduledSubscriptionAtPeriodEnd: restores any stashed future phase(s) and puts
    // the schedule back into 'release' (its original end behavior), without creating a new schedule
    // or subscription.
    private static async resumeScheduledSubscription(
        scheduleId: string,
        subscriptionId: string
    ): Promise<Stripe.Subscription> {
        const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);

        if (schedule.end_behavior !== 'cancel') {
            // No pending schedule-cancellation to undo.
            return await stripe.subscriptions.retrieve(subscriptionId);
        }

        const metadata = schedule.metadata ?? {};
        const pendingPhasesRaw = metadata.cvgen_pending_phases;
        const restoredPhases: Stripe.SubscriptionScheduleUpdateParams.Phase[] = pendingPhasesRaw
            ? JSON.parse(pendingPhasesRaw)
            : [];

        const reopenKeptLastPhase = restoredPhases.length === 0 && metadata.cvgen_reopen_last_phase === 'true';
        const apiKeptPhases = schedule.phases.map((phase, index) =>
            this.toScheduleUpdatePhase(phase, {
                openEnded: reopenKeptLastPhase && index === schedule.phases.length - 1,
            })
        );

        await stripe.subscriptionSchedules.update(scheduleId, {
            end_behavior: 'release',
            phases: [...apiKeptPhases, ...restoredPhases],
            metadata: {
                ...metadata,
                cvgen_pending_phases: '',
                cvgen_reopen_last_phase: '',
            },
        });

        return await stripe.subscriptions.retrieve(subscriptionId);
    }
}