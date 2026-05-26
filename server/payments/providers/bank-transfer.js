async function createPayment({ order }) {
  const prefix = process.env.BANK_TRANSFER_REFERENCE_PREFIX || 'ICUE-DONATE';
  const transferReference = `${prefix}-${order.orderId}`;

  return {
    bankDetails: {
      bankName: process.env.BANK_TRANSFER_BANK_NAME || 'Vietcombank',
      accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME || 'ICUE Vietnam',
      accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER || 'your_account',
      branch: process.env.BANK_TRANSFER_BRANCH || '',
      amountVnd: order.amountVnd,
      transferReference,
      orderId: order.orderId,
    },
  };
}

module.exports = { createPayment };
