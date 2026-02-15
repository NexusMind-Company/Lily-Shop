import TransactionHistory from "../components/wallet/transactionHistory";
import PageSEO from "../components/common/PageSEO";

export default function TransactionHistoryPage() {
  return (
    <>
      <PageSEO title="Transaction History - Lily Shop" />
      <TransactionHistory />
    </>
  );
}