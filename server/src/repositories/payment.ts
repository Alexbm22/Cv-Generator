import { PaymentAttributes, PaymentCreationAttributes } from "@/interfaces/payments";
import { Payment } from "@/models";

const createPayment = async (paymentData: PaymentCreationAttributes) => {
    await Payment.create(paymentData) 
}

const getPayment = async (paymentCriteria: Partial<PaymentAttributes>) => {
    return await Payment.findOne({
        where: paymentCriteria
    });
}

const getPayments = async (paymentsCriteria: Partial<PaymentAttributes>) => {
    return await Payment.findAll({
        where: paymentsCriteria
    });
}

const updatePaymentByFields = async (
    updates: Partial<PaymentAttributes>,
    whereConditions: Partial<PaymentAttributes> 
) => {
    return await Payment.update(updates, {
        where: whereConditions,
        returning: true
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