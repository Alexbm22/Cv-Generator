import { Transaction } from "sequelize";
import { PaymentAttributes, PaymentCreationAttributes } from "@/interfaces/payments";
import { Payment } from "@/models";

const createPayment = async (paymentData: PaymentCreationAttributes, transaction?: Transaction) => {
    await Payment.create(paymentData, { transaction })
}

const getPayment = async (
    paymentCriteria: Partial<PaymentAttributes>,
    options?: { transaction?: Transaction; lock?: boolean }
) => {
    return await Payment.findOne({
        where: paymentCriteria,
        transaction: options?.transaction,
        lock: options?.lock ? options.transaction?.LOCK.UPDATE : undefined,
    });
}

const getPayments = async (
    paymentsCriteria: Partial<PaymentAttributes>,
    options?: {
        order?: Array<[string, 'ASC' | 'DESC']>;
    }
) => {
    return await Payment.findAll({
        where: paymentsCriteria,
        ...options,
    });
}

const updatePaymentByFields = async (
    updates: Partial<PaymentAttributes>,
    whereConditions: Partial<PaymentAttributes>,
    options?: {
        validate?: boolean;
        hooks?: boolean;
        individualHooks?: boolean;
        transaction?: Transaction;
    }
) => {
    return await Payment.update(updates, {
        where: whereConditions,
        returning: true,
        ...options,
    });
}

const deleteUserPayments = async (user_id: number) => {
    return await Payment.destroy({
        where: { user_id },
        individualHooks: true
    });
}

export default {
    createPayment,
    getPayment,
    getPayments,
    updatePaymentByFields,
    deleteUserPayments
}