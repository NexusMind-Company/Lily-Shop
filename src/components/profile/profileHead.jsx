import ProfileHeadOwner from "./profileHeadOwner";
import ProfileHeadVisiting from "./profileHeadVisiting";
import { useSelector } from "react-redux";

const ProfileHead = ({ userId }) => {
  const authUserId = useSelector((state) => state.auth.user?.id);

  // Logic: If the visiting user is the owner, show owner head
  const isOwner = userId === authUserId;

  return (
    <div>
      {isOwner ? <ProfileHeadOwner /> : <ProfileHeadVisiting />}
    </div>
  );
};

export default ProfileHead;