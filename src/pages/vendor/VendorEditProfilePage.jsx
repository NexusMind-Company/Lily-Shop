import { useNavigate } from "react-router-dom";
import VendorEditProfileForm from "../../components/vendor/VendorEditProfileForm";

const VendorEditProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="">
      <VendorEditProfileForm
        onCancel={() => navigate(-1)}
        onSuccess={() => navigate("/vendor/dashboard")}
      />
    </div>
  );
};

export default VendorEditProfilePage;
