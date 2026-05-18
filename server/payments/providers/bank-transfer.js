async function createPayment({ order }) {
  const prefix = process.env.BANK_TRANSFER_REFERENCE_PREFIX || 'ICUE-DONATE';
  const transferReference = `${prefix}-${order.orderId}`;

  return {
    bankDetails: {
      bankName: process.env.BANK_TRANSFER_BANK_NAME,
      accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME,
      accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER,
      branch: process.env.BANK_TRANSFER_BRANCH || '',
      amountVnd: order.amountVnd,
      transferReference,
      orderId: order.orderId,
    },
  };
}

module.exports = { createPayment };
