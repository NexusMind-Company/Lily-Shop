import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Withdraw from "../components/wallet/withdraw";
import PageSEO from "../components/common/PageSEO";

export default function WithdrawPage() {
  const vendorId = useSelector(
    (state) => state.auth?.user_data?.vendor_id || state.profile?.data?.user?.vendor_id || null
  );

  if (vendorId) {
    return <Navigate to="/vendor/dashboard/earnings" replace />;
  }

  return (
    <>
      <PageSEO title="Withdraw - Lily Shop" />
      <Withdraw />
    </>
  );
}
